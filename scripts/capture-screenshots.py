"""
C4dence Screenshot Automation
Captures all pages in desktop, tablet, and mobile viewports
Supports persistent auth session for authenticated pages
"""

from playwright.sync_api import sync_playwright
import os
import sys

# Configuration
BASE_URL = "http://localhost:3000"
OUTPUT_DIR = "E:/BouletStrategies/C4dence/docs/images"
AUTH_STATE_FILE = "E:/BouletStrategies/C4dence/scripts/.auth-state.json"

# Viewports
VIEWPORTS = {
    "desktop": {"width": 1440, "height": 900},
    "tablet": {"width": 768, "height": 1024},
    "mobile": {"width": 375, "height": 812},
}

# Pages to capture (public pages first)
PUBLIC_PAGES = [
    {"name": "01-login", "path": "/login", "description": "Page de connexion"},
    {"name": "22-onboarding", "path": "/onboarding", "description": "Création première organisation"},
]

# Authenticated pages
AUTH_PAGES = [
    {"name": "02-dashboard", "path": "/dashboard", "description": "Tableau de bord principal"},
    {"name": "05-wigs-list", "path": "/dashboard/wigs", "description": "Liste des WIGs"},
    {"name": "12-cadence-page", "path": "/dashboard/cadence", "description": "Page réunion de cadence"},
    {"name": "17-members", "path": "/dashboard/members", "description": "Page des membres"},
    {"name": "18-settings", "path": "/dashboard/settings", "description": "Paramètres"},
]


def capture_page(page, name, path, viewport_name, viewport_size):
    """Capture a single page screenshot"""
    page.set_viewport_size(viewport_size)

    try:
        page.goto(f"{BASE_URL}{path}", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(1000)  # Extra wait for animations

        filename = f"{name}-{viewport_name}.png"
        filepath = os.path.join(OUTPUT_DIR, filename)
        page.screenshot(path=filepath, full_page=False)
        print(f"[OK] Captured: {filename}")
        return True
    except Exception as e:
        print(f"[FAIL] {name}-{viewport_name} - {e}")
        return False


def login_interactive(p):
    """Open browser for manual Google OAuth login and save session"""
    print("\n[AUTH] Opening browser for manual login...")
    print("[AUTH] Please log in with Google, then press ENTER when on dashboard.\n")

    browser = p.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()

    page.goto(f"{BASE_URL}/login", wait_until="networkidle")

    # Wait for user to complete OAuth and reach dashboard
    input("[AUTH] Press ENTER after logging in and reaching the dashboard...")

    # Save the auth state
    context.storage_state(path=AUTH_STATE_FILE)
    print(f"[OK] Auth state saved to {AUTH_STATE_FILE}")

    browser.close()
    return True


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Check for --login flag
    if "--login" in sys.argv:
        with sync_playwright() as p:
            login_interactive(p)
        print("\n[OK] Login complete. Run again without --login to capture screenshots.")
        return

    with sync_playwright() as p:
        # Try to load existing auth state
        has_auth = os.path.exists(AUTH_STATE_FILE)

        if has_auth:
            print(f"[OK] Loading saved auth state...")
            context = p.chromium.launch(headless=True).new_context(storage_state=AUTH_STATE_FILE)
        else:
            print("[INFO] No auth state found. Public pages only.")
            print("[INFO] Run with --login flag to authenticate for protected pages.")
            context = p.chromium.launch(headless=True).new_context()

        page = context.new_page()
        captured = 0
        failed = 0

        print("\n=== Starting C4dence Screenshot Capture ===\n")
        print("=" * 50)

        # Capture public pages
        print("\n--- PUBLIC PAGES ---\n")
        for page_info in PUBLIC_PAGES:
            for viewport_name, viewport_size in VIEWPORTS.items():
                if capture_page(page, page_info["name"], page_info["path"], viewport_name, viewport_size):
                    captured += 1
                else:
                    failed += 1

        # For authenticated pages, check if we can access dashboard
        print("\n--- CHECKING AUTHENTICATION ---\n")
        page.set_viewport_size(VIEWPORTS["desktop"])
        page.goto(f"{BASE_URL}/dashboard", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(2000)

        current_url = page.url
        if "/login" in current_url:
            print("[WARN] Not authenticated - skipping protected pages")
            if has_auth:
                print("[INFO] Auth state may be expired. Run with --login to re-authenticate.")
        else:
            print("[OK] Authenticated - capturing protected pages\n")

            # Capture authenticated pages
            print("\n--- AUTHENTICATED PAGES ---\n")
            for page_info in AUTH_PAGES:
                for viewport_name, viewport_size in VIEWPORTS.items():
                    if capture_page(page, page_info["name"], page_info["path"], viewport_name, viewport_size):
                        captured += 1
                    else:
                        failed += 1

        context.browser.close()

        print("\n" + "=" * 50)
        print(f"\n=== SUMMARY ===")
        print(f"   Captured: {captured}")
        print(f"   Failed: {failed}")
        print(f"   Output: {OUTPUT_DIR}\n")

        if not has_auth or "/login" in current_url:
            print("[TIP] To capture authenticated pages:")
            print("      python scripts/capture-screenshots.py --login\n")


if __name__ == "__main__":
    main()
