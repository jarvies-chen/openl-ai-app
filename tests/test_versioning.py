import sys
import os
import asyncio
import json
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import doc_manager
from models import Rule
from version_control import RuleDiffer

async def test_versioning():
    print("Starting Versioning Test...")
    
    # 1. Setup Dummy Data
    filename = "Policy_Test.docx"
    temp_path_v1 = "temp_v1.docx"
    temp_path_v2 = "temp_v2.docx"
    
    with open(temp_path_v1, "w") as f: f.write("Version 1 Content")
    with open(temp_path_v2, "w") as f: f.write("Version 2 Content (Modified)")
    
    rules_v1 = [
        Rule(id="R1", name="Rule1", summary="Original Rule 1", condition="A > 10", result="True"),
        Rule(id="R2", name="Rule2", summary="Original Rule 2", condition="B < 5", result="False")
    ]
    
    rules_v2 = [
        Rule(id="R1", name="Rule1", summary="Original Rule 1", condition="A > 10", result="True"), # Unchanged
        Rule(id="R2", name="Rule2", summary="Original Rule 2", condition="B < 10", result="False"), # Modified Condition
        Rule(id="R3", name="Rule3", summary="New Rule 3", condition="C == 0", result="True") # Added
    ]
    
    try:
        # 2. Save Version 1
        print("Saving Version 1...")
        v1_meta = doc_manager.add_document(temp_path_v1, filename, rules_v1)
        print(f"Saved Version {v1_meta.version}")
        
        # 3. Save Version 2
        print("Saving Version 2...")
        v2_meta = doc_manager.add_document(temp_path_v2, filename, rules_v2)
        print(f"Saved Version {v2_meta.version}")
        
        if v2_meta.version != v1_meta.version + 1:
            print("FAILURE: Version number did not increment correctly.")
            return
            
        # 4. Get Diff
        print("Calculating Diff...")
        diff = RuleDiffer.diff(rules_v1, rules_v2)
        
        print(f"Added: {len(diff.added)}")
        print(f"Removed: {len(diff.removed)}")
        print(f"Modified: {len(diff.modified)}")
        
        if len(diff.added) == 1 and diff.added[0].id == "R3":
            print("SUCCESS: Correctly identified added rule.")
        else:
            print("FAILURE: Added rule detection failed.")
            
        if len(diff.modified) == 1 and diff.modified[0]['rule'].id == "R2":
            print("SUCCESS: Correctly identified modified rule.")
            print(f"Changes: {diff.modified[0]['changes']}")
        else:
            print("FAILURE: Modified rule detection failed.")
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Cleanup
        if os.path.exists(temp_path_v1): os.remove(temp_path_v1)
        if os.path.exists(temp_path_v2): os.remove(temp_path_v2)

if __name__ == "__main__":
    asyncio.run(test_versioning())
