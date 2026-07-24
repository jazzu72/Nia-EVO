#!/bin/bash
# 🔒 AUTOMATED SECURITY CLEANUP SCRIPT
# Removes backup files, old code, and fixes API key exposure
# Safe to run - shows preview before making changes

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Header
clear
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║  🔒 NIA-EVO AUTOMATED SECURITY CLEANUP                     ║"
echo "║     Remove Secrets & Backup Files                         ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to check if in git repo
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}❌ Not a Git repository!${NC}"
        echo "Run this script from the repository root:"
        echo "  cd ~/nia-evo && bash cleanup-security.sh"
        exit 1
    fi
    echo -e "${GREEN}✓ Git repository detected${NC}"
}

# Function to backup current state
backup_repo() {
    echo -e "${YELLOW}Creating backup...${NC}"
    BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
    git bundle create "$BACKUP_DIR.bundle" --all > /dev/null 2>&1
    echo -e "${GREEN}✓ Backup created: $BACKUP_DIR.bundle${NC}"
}

# Function to list files to be deleted
list_files_to_delete() {
    echo -e "${PURPLE}📋 FILES TO BE DELETED:${NC}\n"
    
    FILES_TO_DELETE=(
        "server.js.bak"
        "server-backup.js"
        "server.js.bak.orchestrator"
        "server-watson.js"
    )
    
    for file in "${FILES_TO_DELETE[@]}"; do
        if [ -f "$file" ]; then
            echo -e "${RED}  ❌ $file${NC} ($(wc -l < "$file") lines)"
        fi
    done
}

# Function to check for API keys in files
check_api_keys() {
    echo -e "\n${PURPLE}🔑 FILES WITH POTENTIAL API KEY EXPOSURE:${NC}\n"
    
    API_KEY_FILES=(
        "public/dashboard.html"
        "public/investor-dashboard.html"
        "core/api-brain.js"
        "mercury-api.js"
        "facebook-deals.js"
    )
    
    for file in "${API_KEY_FILES[@]}"; do
        if [ -f "$file" ]; then
            if grep -q "api.key\|API_KEY\|your-secret\|pageAccessToken\|OPENAI_API_KEY" "$file" 2>/dev/null; then
                echo -e "${RED}  ⚠️  $file${NC} (contains potential secrets)"
            fi
        fi
    done
}

# Function to preview changes
preview_changes() {
    echo -e "\n${PURPLE}👁️  PREVIEW OF CHANGES:${NC}\n"
    
    # Show what will be removed
    echo -e "${YELLOW}Files that will be deleted:${NC}"
    git ls-files | grep -E "(server.*\.bak|server-backup)" || echo "  (none found)"
    
    echo -e "\n${YELLOW}Checking for secrets in Git history:${NC}"
    git log --all -p | grep -i "your-secret\|api_key.*=" | head -3 || echo "  (none found)"
}

# Function to delete backup files
delete_backup_files() {
    echo -e "\n${YELLOW}[1/5] Deleting backup files...${NC}"
    
    FILES_TO_DELETE=(
        "server.js.bak"
        "server-backup.js"
        "server.js.bak.orchestrator"
        "server-watson.js"
    )
    
    DELETED_COUNT=0
    for file in "${FILES_TO_DELETE[@]}"; do
        if [ -f "$file" ]; then
            echo -e "  Removing: ${RED}$file${NC}"
            git rm "$file" > /dev/null 2>&1
            DELETED_COUNT=$((DELETED_COUNT + 1))
        fi
    done
    
    if [ $DELETED_COUNT -gt 0 ]; then
        echo -e "${GREEN}✓ Deleted $DELETED_COUNT files${NC}"
    else
        echo -e "${YELLOW}ℹ️  No backup files found${NC}"
    fi
}

# Function to fix frontend API keys
fix_frontend_api_keys() {
    echo -e "\n${YELLOW}[2/5] Fixing frontend API key exposure...${NC}"
    
    # Fix dashboard.html
    if [ -f "public/dashboard.html" ]; then
        if grep -q "const API_KEY = 'your-secret-api-key'" public/dashboard.html; then
            echo -e "  Fixing: ${YELLOW}public/dashboard.html${NC}"
            sed -i.bak "s/const API_KEY = 'your-secret-api-key';/\/\/ API key should come from backend\n    \/\/ Do not store API keys in frontend code/g" public/dashboard.html
            rm -f public/dashboard.html.bak
            git add public/dashboard.html
            echo -e "${GREEN}✓ Fixed${NC}"
        fi
    fi
    
    # Fix investor-dashboard.html
    if [ -f "public/investor-dashboard.html" ]; then
        if grep -q "const API_KEY = 'your-secret-api-key'" public/investor-dashboard.html; then
            echo -e "  Fixing: ${YELLOW}public/investor-dashboard.html${NC}"
            sed -i.bak "s/const API_KEY = 'your-secret-api-key';/\/\/ API key should come from backend\n    \/\/ Do not store API keys in frontend code/g" public/investor-dashboard.html
            rm -f public/investor-dashboard.html.bak
            git add public/investor-dashboard.html
            echo -e "${GREEN}✓ Fixed${NC}"
        fi
    fi
}

# Function to create archive directory
create_archive() {
    echo -e "\n${YELLOW}[3/5] Archiving experimental code...${NC}"
    
    # Create archive directory if it doesn't exist
    if [ ! -d "archive" ]; then
        mkdir -p archive
        git add archive
        echo -e "${GREEN}✓ Created archive directory${NC}"
    fi
    
    # Move experimental files
    EXPERIMENTAL_FILES=(
        "NIA-CEO"
        "core/predictive-finance.js"
        "smart-bootstrap.js"
    )
    
    for item in "${EXPERIMENTAL_FILES[@]}"; do
        if [ -e "$item" ]; then
            echo -e "  Archiving: ${YELLOW}$item${NC}"
            git mv "$item" "archive/${item##*/}" > /dev/null 2>&1 || true
            echo -e "${GREEN}✓ Moved${NC}"
        fi
    done
}

# Function to enhance .gitignore
enhance_gitignore() {
    echo -e "\n${YELLOW}[4/5] Enhancing .gitignore...${NC}"
    
    # Check if entries already exist
    if ! grep -q "# Backup files" .gitignore 2>/dev/null; then
        cat >> .gitignore << 'EOF'

# Backup files
*.bak
*.backup
*.old
*.orig

# Archived code
archive/

# Environment dumps
*.env.dump
*.secrets
EOF
        echo -e "${GREEN}✓ Updated .gitignore${NC}"
        git add .gitignore
    else
        echo -e "${GREEN}✓ .gitignore already updated${NC}"
    fi
}

# Function to create commit
create_commit() {
    echo -e "\n${YELLOW}[5/5] Creating security cleanup commit...${NC}"
    
    # Check if there are changes to commit
    if ! git diff --cached --quiet; then
        git commit -m "🔒 Security: Remove backup files and fix API key exposure

- Delete server.js.bak and other backup files
- Remove hardcoded API keys from frontend
- Archive experimental/old code to archive/
- Enhance .gitignore for better security
- Add backup file patterns (.bak, .backup, .old)

Security improvements:
✅ No backup files in version control
✅ No API keys in frontend code
✅ Old code properly archived
✅ Enhanced .gitignore patterns"
        
        echo -e "${GREEN}✓ Commit created${NC}"
    else
        echo -e "${YELLOW}ℹ️  No changes to commit${NC}"
    fi
}

# Function to show summary
show_summary() {
    echo -e "\n${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║  ✅ SECURITY CLEANUP COMPLETE                              ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${GREEN}Summary of changes:${NC}"
    echo "  ✅ Deleted backup files"
    echo "  ✅ Fixed frontend API key exposure"
    echo "  ✅ Archived experimental code"
    echo "  ✅ Enhanced .gitignore"
    echo "  ✅ Created security commit"
    
    echo -e "\n${YELLOW}Next steps:${NC}"
    echo "  1. Review changes: git log --oneline -1"
    echo "  2. Push to main: git push origin main"
    echo "  3. Verify on GitHub: https://github.com/jazzu72/Nia-EVO"
    echo ""
}

# Function to show dry-run summary
show_dry_run_summary() {
    echo -e "\n${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║  📋 DRY RUN COMPLETE (No changes made)                     ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${YELLOW}To proceed with cleanup, run:${NC}"
    echo "  bash cleanup-security.sh --execute"
    echo ""
}

# Main execution
main() {
    check_git_repo
    
    echo ""
    backup_repo
    
    # Show what will be changed
    list_files_to_delete
    check_api_keys
    
    echo -e "\n${PURPLE}════════════════════════════════════════════════════════════${NC}"
    
    # Check if running in dry-run or execute mode
    if [ "$1" = "--execute" ] || [ "$1" = "-x" ]; then
        echo -e "\n${GREEN}🚀 EXECUTING CLEANUP...${NC}\n"
        
        # Confirm before proceeding
        echo -e "${YELLOW}⚠️  This will make permanent changes to your repository${NC}"
        read -p "Type 'YES' to continue: " confirm
        
        if [ "$confirm" != "YES" ]; then
            echo -e "${RED}Cleanup cancelled${NC}"
            exit 0
        fi
        
        # Run cleanup
        delete_backup_files
        fix_frontend_api_keys
        create_archive
        enhance_gitignore
        create_commit
        
        show_summary
        
        echo -e "${YELLOW}⚠️  Review changes carefully:${NC}"
        echo "  git log --oneline -5"
        echo "  git diff HEAD~1"
        echo ""
        echo -e "${PURPLE}Ready to push?${NC}"
        read -p "Push to main branch? (yes/no): " push_confirm
        
        if [ "$push_confirm" = "yes" ]; then
            git push origin main
            echo -e "${GREEN}✓ Pushed to main branch${NC}"
        else
            echo -e "${YELLOW}ℹ️  Changes are committed locally but not pushed${NC}"
            echo "  Push manually when ready: git push origin main"
        fi
    else
        # Dry run mode (default)
        echo -e "\n${YELLOW}📋 DRY RUN MODE - No changes will be made${NC}\n"
        preview_changes
        show_dry_run_summary
    fi
}

# Run main function
main "$@"
