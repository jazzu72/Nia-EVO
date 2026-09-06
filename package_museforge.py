import zipfile

files_to_zip = {
    "museforge_deploy/museforge_backend_webhook.py": "museforge_backend_webhook.py",
    "museforge_deploy/Dockerfile": "Dockerfile",
    "museforge_deploy/requirements.txt": "requirements.txt",
    "museforge_deploy/azure-deploy.yaml": "azure-deploy.yaml",
    "museforge_deploy/.github/workflows/deploy-museforge-backend.yml": ".github/workflows/deploy-museforge-backend.yml"
}

zip_path = "museforge_backend_launch_bundle.zip"

with zipfile.ZipFile(zip_path, 'w') as zipf:
    for src_path, archive_name in files_to_zip.items():
        zipf.write(src_path, arcname=archive_name)

print(f"✅ Backend deployment package created at: {zip_path}")
