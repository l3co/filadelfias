# Maestro E2E Tests - Mobile App

## Setup

### 1. Install Maestro CLI

```bash
# macOS
curl -Ls "https://get.maestro.mobile.dev" | bash

# Verify installation
maestro --version
```

### 2. Start the Backend

```bash
cd apps/backend
./start.sh
# or
uvicorn src.main:app --reload --port 8000
```

### 3. Start the Mobile App

```bash
cd apps/mobile
npx expo start

# For iOS Simulator
npx expo run:ios

# For Android Emulator
npx expo run:android
```

## Running Tests

### Run All Tests

```bash
cd apps/mobile
maestro test .maestro/flows/
```

### Run Specific Flow

```bash
maestro test .maestro/flows/login.yaml
```

### Run by Tag

```bash
# Smoke tests only
maestro test .maestro/flows/ --include-tags smoke

# Critical tests
maestro test .maestro/flows/ --include-tags critical

# Auth tests
maestro test .maestro/flows/ --include-tags auth
```

### Run with Report

```bash
maestro test .maestro/flows/ --format junit --output ./test-results/
```

## Test Flows

| Flow | Description | Tags |
|------|-------------|------|
| `login.yaml` | Happy path login flow | smoke, critical, auth |
| `login_validation.yaml` | Form validation tests | regression, auth, validation |
| `forgot_password.yaml` | Password recovery flow | regression, auth |
| `change_password.yaml` | First-time password change | regression, auth, security |
| `admin_navigation.yaml` | Admin dashboard navigation | smoke, critical, navigation |
| `member_navigation.yaml` | Member area navigation | regression, navigation, member |

## Environment Variables

Tests use the following environment variables (defined in `config.yaml`):

| Variable | Default | Description |
|----------|---------|-------------|
| `API_URL` | `http://localhost:8000` | Backend API URL |
| `TEST_EMAIL` | `admin@test.com` | Admin test user email |
| `TEST_PASSWORD` | `Test123!@#` | Admin test user password |

## Writing New Tests

### Basic Structure

```yaml
appId: com.filadelfias.app
tags:
  - smoke
  - feature-name

---

- launchApp:
    clearState: true

- assertVisible:
    text: "Expected Text"

- tapOn:
    text: "Button Text"

- inputText: "Input value"

- takeScreenshot: screenshot_name
```

### Common Commands

```yaml
# Wait for element
- extendedWaitUntil:
    visible:
      text: "Text"
    timeout: 10000

# Scroll
- scroll

# Swipe
- swipe:
    direction: LEFT

# Go back
- back

# Assert not visible
- assertNotVisible:
    text: "Text"

# Conditional tap
- tapOn:
    text: "Optional Button"
    optional: true
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run Maestro Tests
  uses: mobile-dev-inc/action-maestro-cloud@v1
  with:
    api-key: ${{ secrets.MAESTRO_CLOUD_API_KEY }}
    app-file: app-release.apk
    flows: .maestro/flows/
    include-tags: smoke
```

## Troubleshooting

### App not launching
- Ensure the app is installed on the simulator/emulator
- Check `appId` matches `app.json` bundle identifier

### Element not found
- Use `maestro studio` to inspect the app hierarchy
- Try using `id` instead of `text` for more reliable selection

### Timeout errors
- Increase timeout in `extendedWaitUntil`
- Check if backend is running and accessible

## Debug Mode

```bash
# Interactive mode
maestro studio

# Verbose output
maestro test .maestro/flows/login.yaml --debug-output
```
