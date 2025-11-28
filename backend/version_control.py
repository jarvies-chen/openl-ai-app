import os
import json
import hashlib
import shutil
from typing import List, Dict, Optional, Any
from datetime import datetime
from typing import List, Dict, Optional, Any
from datetime import datetime
from pydantic import BaseModel
from models import Rule

class VersionMetadata(BaseModel):
    version: int
    filename: str
    original_filename: str
    file_hash: str
    created_at: str
    rules_path: str
    file_path: str
    comments: Optional[str] = None

class DocumentEntry(BaseModel):
    base_filename: str
    versions: List[VersionMetadata]

class DiffResult(BaseModel):
    added: List[Rule]
    removed: List[Rule]
    modified: List[Dict[str, Any]] # { "rule": Rule, "changes": { "field": {"old": val, "new": val} } }

class DocumentManager:
    def __init__(self, storage_dir: str = "data_storage"):
        self.storage_dir = storage_dir
        self.index_path = os.path.join(storage_dir, "documents.json")
        self.files_dir = os.path.join(storage_dir, "files")
        self.rules_dir = os.path.join(storage_dir, "rules")
        
        os.makedirs(self.files_dir, exist_ok=True)
        os.makedirs(self.rules_dir, exist_ok=True)
        
        self.index: Dict[str, DocumentEntry] = self._load_index()

    def _load_index(self) -> Dict[str, DocumentEntry]:
        if os.path.exists(self.index_path):
            try:
                with open(self.index_path, 'r') as f:
                    data = json.load(f)
                    return {k: DocumentEntry(**v) for k, v in data.items()}
            except Exception as e:
                print(f"Error loading index: {e}")
                return {}
        return {}

    def _save_index(self):
        with open(self.index_path, 'w') as f:
            json.dump({k: v.dict() for k, v in self.index.items()}, f, indent=2)

    def calculate_hash(self, file_path: str) -> str:
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    def _normalize_filename(self, filename: str) -> str:
        """Normalizes a filename to a consistent key (base name)."""
        # If the filename is already a key in the index, return it
        if filename in self.index:
            return filename
            
        # Remove extension
        name_without_ext = os.path.splitext(filename)[0]
        
        # Regex to remove dates (YYYY-MM-DD, YYYYMMDD, DD-MM-YYYY) and version suffixes (v1, v2, etc.)
        import re
        base_name = name_without_ext
        base_name = re.sub(r'[-_ ]?\d{4}[-_]\d{2}[-_]\d{2}', '', base_name)
        base_name = re.sub(r'[-_ ]?\d{2}[-_]\d{2}[-_]\d{4}', '', base_name)
        base_name = re.sub(r'[-_ ]?[vV]\d+', '', base_name)
        base_name = re.sub(r'\s+', ' ', base_name).strip()
        base_name = re.sub(r'_+', '_', base_name).strip('_')
        
        if not base_name:
            base_name = name_without_ext
            
        return base_name

    def add_document(self, temp_file_path: str, original_filename: str, rules: List[Rule], comments: Optional[str] = None) -> VersionMetadata:
        # 1. Calculate Hash
        file_hash = self.calculate_hash(temp_file_path)
        
        # 2. Determine Base Filename
        doc_key = self._normalize_filename(original_filename)
        
        # 3. Check for existing versions
        if doc_key not in self.index:
            self.index[doc_key] = DocumentEntry(base_filename=doc_key, versions=[])
        
        entry = self.index[doc_key]
        
        # ... (rest of logic) ...
        
        # 4. Create New Version
        new_version_num = len(entry.versions) + 1
        timestamp = datetime.now().isoformat()
        
        # 5. Save File
        # Use extension from temp_file_path if available and valid, otherwise fallback to original
        _, temp_ext = os.path.splitext(temp_file_path)
        if not temp_ext:
             _, temp_ext = os.path.splitext(original_filename)
             
        stored_filename = f"{doc_key}_v{new_version_num}_{file_hash[:8]}{temp_ext}"
        stored_file_path = os.path.join(self.files_dir, stored_filename)
        
        # Only copy if it doesn't exist (deduplication of storage)
        if not os.path.exists(stored_file_path):
            shutil.copy2(temp_file_path, stored_file_path)
        
        # 6. Save Rules
        rules_filename = f"{doc_key}_v{new_version_num}_rules.json"
        rules_path = os.path.join(self.rules_dir, rules_filename)
        with open(rules_path, 'w') as f:
            json.dump([r.dict() for r in rules], f, indent=2)
            
        # 7. Update Index
        new_version = VersionMetadata(
            version=new_version_num,
            filename=stored_filename,
            original_filename=original_filename,
            file_hash=file_hash,
            created_at=timestamp,
            rules_path=rules_filename,
            file_path=stored_filename,
            comments=comments
        )
        entry.versions.append(new_version)
        self._save_index()
        
        return new_version

    def get_documents(self) -> List[DocumentEntry]:
        """Returns a list of all document entries."""
        return list(self.index.values())

    def get_versions(self, base_filename: str) -> List[VersionMetadata]:
        key = self._normalize_filename(base_filename)
        if key in self.index:
            return self.index[key].versions
        return []

    def get_rules(self, base_filename: str, version: int) -> List[Rule]:
        key = self._normalize_filename(base_filename)
        if key not in self.index:
            return []
        
        entry = self.index[key]
        target_version = next((v for v in entry.versions if v.version == version), None)
        
        if not target_version:
            return []
            
        rules_path = os.path.join(self.rules_dir, target_version.rules_path)
        if os.path.exists(rules_path):
            with open(rules_path, 'r') as f:
                data = json.load(f)
                return [Rule(**r) for r in data]
        return []

    def get_rule_history(self, base_filename: str, rule_id: str) -> List[Dict[str, Any]]:
        """Returns the history of a specific rule across all versions."""
        key = self._normalize_filename(base_filename)
        if key not in self.index:
            return []
            
        entry = self.index[key]
        history = []
        
        # Sort versions ascending to track changes over time
        sorted_versions = sorted(entry.versions, key=lambda v: v.version)
        
        last_rule_state = None
        
        for version in sorted_versions:
            rules_path = os.path.join(self.rules_dir, version.rules_path)
            if os.path.exists(rules_path):
                try:
                    with open(rules_path, 'r') as f:
                        rules_data = json.load(f)
                        # Find the rule
                        rule_data = next((r for r in rules_data if r.get('id') == rule_id), None)
                        
                        if rule_data:
                            # Check if changed from previous version
                            # We compare the dictionary representation
                            # If it's the first version (last_rule_state is None), we always include it
                            is_changed = True
                            if last_rule_state:
                                # Compare relevant fields or full dict
                                # We exclude fields that might not matter for "content" history if needed, 
                                # but for now strict equality is best.
                                if rule_data == last_rule_state:
                                    is_changed = False
                            
                            if is_changed:
                                history.append({
                                    "version": version.version,
                                    "created_at": version.created_at,
                                    "comments": version.comments,
                                    "rule": rule_data
                                })
                                last_rule_state = rule_data
                        else:
                            # Rule doesn't exist in this version (maybe deleted or not created yet)
                            # If it existed before, maybe we should record a "Deleted" event?
                            # For now, just ignore.
                            last_rule_state = None
                            
                except Exception as e:
                    print(f"Error reading rules for version {version.version}: {e}")
                    
        # Return reversed (newest first)
        return list(reversed(history))

    def delete_document(self, base_filename: str) -> bool:
        """Deletes a document and all its versions."""
        key = self._normalize_filename(base_filename)
        if key not in self.index:
            return False
            
        entry = self.index[key]
        
        # Delete all version files
        for version in entry.versions:
            # Delete content file
            file_path = os.path.join(self.files_dir, version.filename)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except OSError:
                    pass # Ignore if already gone
            
            # Delete rules file
            rules_path = os.path.join(self.rules_dir, version.rules_path)
            if os.path.exists(rules_path):
                try:
                    os.remove(rules_path)
                except OSError:
                    pass

        # Remove from index
        del self.index[key]
        self._save_index()
        return True

class RuleDiffer:
    @staticmethod
    def diff(old_rules: List[Rule], new_rules: List[Rule]) -> DiffResult:
        added = []
        removed = []
        modified = []
        
        # Map old rules by ID and Name/Summary for fuzzy matching
        old_map_id = {r.id: r for r in old_rules if r.id}
        # Fallback map: Name + Summary (first 20 chars)
        old_map_fuzzy = {f"{r.name}|{r.summary[:20]}": r for r in old_rules}
        
        processed_old_ids = set()
        
        for new_rule in new_rules:
            # Try matching by ID first
            match = None
            if new_rule.id in old_map_id:
                match = old_map_id[new_rule.id]
            else:
                # Try fuzzy match
                key = f"{new_rule.name}|{new_rule.summary[:20]}"
                if key in old_map_fuzzy:
                    match = old_map_fuzzy[key]
            
            if match:
                processed_old_ids.add(match.id)
                # Check for modifications
                changes = {}
                # Compare fields
                fields_to_compare = ['condition', 'result', 'summary', 'category', 'rule_type']
                for field in fields_to_compare:
                    old_val = getattr(match, field)
                    new_val = getattr(new_rule, field)
                    if old_val != new_val:
                        changes[field] = {"old": old_val, "new": new_val}
                
                if changes:
                    modified.append({"rule": new_rule, "changes": changes})
            else:
                added.append(new_rule)
                
        # Find removed rules
        for old_rule in old_rules:
            if old_rule.id not in processed_old_ids:
                # Check if it was matched fuzzy
                key = f"{old_rule.name}|{old_rule.summary[:20]}"
                # If this key was used for a match, it's not removed. 
                # But we tracked processed_old_ids using the MATCH's id.
                # So if old_rule.id is not in processed_old_ids, it wasn't matched by ID.
                # Was it matched by fuzzy?
                # This logic is slightly flawed if fuzzy match happened but ID didn't match.
                # Let's refine:
                # We need to track which OLD rules were matched, regardless of how.
                pass 
        
        # Re-implementing matched tracking more robustly
        matched_old_rules = set()
        
        # Pass 1: Match
        for new_rule in new_rules:
            match = None
            if new_rule.id in old_map_id:
                match = old_map_id[new_rule.id]
            else:
                key = f"{new_rule.name}|{new_rule.summary[:20]}"
                if key in old_map_fuzzy:
                    match = old_map_fuzzy[key]
            
            if match:
                matched_old_rules.add(match.id)
        
        # Pass 2: Identify Removed
        for old_rule in old_rules:
            if old_rule.id not in matched_old_rules:
                removed.append(old_rule)
                
        return DiffResult(added=added, removed=removed, modified=modified)
