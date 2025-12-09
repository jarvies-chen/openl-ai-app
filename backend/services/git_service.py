import os
import subprocess
import shutil
import logging
from typing import Optional, List
from fastapi import HTTPException
import requests
from urllib.parse import quote_plus

logger = logging.getLogger(__name__)

class GitService:
    def __init__(self):
        self.target_dir = os.getenv("TARGET_DIR_RULES", r"E:\GENESIS\RND\openl-claim\DESIGN\rules\Openl AI Demo\rules")
        self.repo_dir = os.getenv("REPO_DIR", r"E:\GENESIS\RND\openl-claim")
        self.branch = os.getenv("GIT_BRANCH", "openl-ai-demo")
        self.target_branch = os.getenv("GIT_TARGET_BRANCH", "development")
        self.api_url = os.getenv("GIT_API_URL", "https://gitlab.com/api/v4")
        self.token = os.getenv("GIT_TOKEN", "")
        self.project_id = os.getenv("GIT_PROJECT_ID", "")

    def _run_git(self, args: List[str], cwdir: str = None) -> str:
        cwd = cwdir or self.repo_dir
        try:
            result = subprocess.run(
                ["git"] + args,
                cwd=cwd,
                check=True,
                capture_output=True,
                text=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            error_msg = e.stderr.strip() if e.stderr else str(e)
            logger.error(f"Git command failed: {' '.join(args)}. Error: {error_msg}")
            raise Exception(f"Git Error: {error_msg}")

    def create_pr_background(self, file_path: str, clean_name: str, delete_after: bool = True):
        """
        Background task to handle the full Git workflow:
        Checkout -> Pull -> Add -> Commit -> Push -> Create MR
        """
        try:
            logger.info(f"Starting Git background task for {clean_name}")
            
            # Ensure target directory exists
            if not os.path.exists(self.target_dir):
                os.makedirs(self.target_dir, exist_ok=True)
                
            # Copy file to repo target dir
            repo_file_path = os.path.join(self.target_dir, clean_name)
            shutil.copy(file_path, repo_file_path)
            
            # 1. Checkout Branch
            self._run_git(["checkout", self.branch])
            
            # 2. Pull latest
            try:
                self._run_git(["pull", "origin", self.branch])
            except Exception:
                logger.warning("Git pull failed, continuing (might be new branch)")

            # 3. Add file
            rel_path = os.path.relpath(repo_file_path, self.repo_dir)
            self._run_git(["add", rel_path])
            
            # 4. Commit
            try:
                self._run_git(["commit", "-m", f"Update OpenL rules: {clean_name}"])
            except Exception as e:
                # If nothing to commit (clean working tree), that's fine
                if "nothing to commit" in str(e).lower():
                    logger.info("Nothing to commit.")
                    return "No changes to commit."
                raise e

            # 5. Push
            self._run_git(["push", "origin", self.branch])
            
            # 6. Create MR
            mr_url = self._create_merge_request(clean_name)
            
            logger.info(f"Git operations completed. MR URL: {mr_url}")

            # Cleanup temp file if requested (not the repo file, but the source temp file)
            if delete_after and os.path.exists(file_path):
                 os.remove(file_path)

        except Exception as e:
            logger.error(f"Background Git Task Failed: {e}")
            # In a real app, we might want to update a status database
            
    def _create_merge_request(self, filename: str) -> str:
        if not self.token:
            return "No Git Token configured."

        headers = {"PRIVATE-TOKEN": self.token}
        project_id = self.project_id
        
        # Resolve Project ID if missing
        if not project_id:
            try:
                remote_url = self._run_git(["remote", "get-url", "origin"])
                path = ""
                if "git@" in remote_url:
                    path = remote_url.split(":")[-1].replace(".git", "")
                else:
                    from urllib.parse import urlparse
                    parsed = urlparse(remote_url)
                    path = parsed.path.replace(".git", "").lstrip("/")
                    if path.startswith("gitlab/"): path = path[7:]
                
                encoded_path = quote_plus(path)
                resp = requests.get(f"{self.api_url}/projects/{encoded_path}", headers=headers)
                if resp.status_code == 200:
                    project_id = resp.json().get("id")
            except Exception as e:
                logger.error(f"Failed to resolve project ID: {e}")
        
        if not project_id:
            return "Could not determine Project ID."

        payload = {
            "source_branch": self.branch,
            "target_branch": self.target_branch,
            "title": f"Update OpenL Rules: {filename}",
            "description": f"Automated update from OpenL Assistant.\n\nFile: {filename}",
            "remove_source_branch": False
        }
        
        try:
            resp = requests.post(f"{self.api_url}/projects/{project_id}/merge_requests", headers=headers, json=payload)
            if resp.status_code in [200, 201]:
                return resp.json().get("web_url", "")
            elif resp.status_code == 409:
                 # Already exists
                 resp = requests.get(f"{self.api_url}/projects/{project_id}/merge_requests?state=opened&source_branch={self.branch}", headers=headers)
                 if resp.status_code == 200 and resp.json():
                     return resp.json()[0].get("web_url", "")
        except Exception as e:
            logger.error(f"Failed to create MR: {e}")
            
        return "Failed to create MR"
