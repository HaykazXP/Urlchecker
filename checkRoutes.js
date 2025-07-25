const fs = require('fs');
const path = require('path');

const ROUTES_FILE = path.join(__dirname, 'routes.txt');
const FORBIDDEN_LOG = path.join(__dirname, 'forbidden_routes.txt');

// Clear the forbidden log file at the start
fs.writeFileSync(FORBIDDEN_LOG, '');

// Function to check if a URI has forbidden characters
function hasForbiddenChars(uri) {
  // Remove content inside {} braces (Laravel route parameters)
  const uriWithoutParams = uri.replace(/\{[^}]*\}/g, '');
  
  // Check for uppercase letters (not inside braces)
  const hasUppercase = /[A-Z]/.test(uriWithoutParams);
  
  // Check for special characters (not / or -)
  const hasSpecialChars = /[^a-zA-Z0-9\/\-\.\:\_]/.test(uriWithoutParams);
  
  // Check for spaces or %20
  const hasSpaces = /\s/.test(uri) || /%20/.test(uri);
  
  return hasUppercase || hasSpecialChars || hasSpaces;
}

// Function to extract URI from a line
function extractUri(line) {
  // Extract URI from fixed position: characters 52 to 127
  if (line.length >= 127) {
    return line.substring(52, 127).trim();
  }
  return null;
}

// Function to extract middleware from a line
function extractMiddleware(line) {
  // Extract middleware from fixed position: characters 300 to 519
  if (line.length >= 519) {
    return line.substring(300, 519).trim();
  }
  return '';
}

// Function to check all routes
function checkRoutes() {
  try {
    const content = fs.readFileSync(ROUTES_FILE, 'utf8');
    const lines = content.split('\n');
    
    console.log(`Checking routes from: ${ROUTES_FILE}`);
    let totalRoutes = 0;
    let forbiddenRoutes = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip first 3 rows (headers) and empty lines
      if (i < 3 || line.includes('+---') || line.trim() === '') {
        continue;
      }
      
      const uri = extractUri(line);
      if (uri) {
        // Skip __clockwork and _dusk routes
        if (uri.startsWith('__clockwork') || uri.startsWith('_dusk')) {
          console.log(`Skipping: ${uri}`);
          continue;
        }
        
        // Skip routes with admin.auth or auth middleware
        const middleware = extractMiddleware(line);
        if (middleware.includes('admin.auth') || middleware.includes('auth')) {
          console.log(`Skipping (auth middleware): ${uri}`);
          continue;
        }
        
        totalRoutes++;
        console.log(`Checking: ${uri}`);
        
        if (hasForbiddenChars(uri)) {
          console.log(`FORBIDDEN: ${uri}`);
          fs.appendFileSync(FORBIDDEN_LOG, line + '\n');
          forbiddenRoutes++;
        }
      }
    }
    
    console.log(`\nSummary:`);
    console.log(`Total routes checked: ${totalRoutes}`);
    console.log(`Forbidden routes found: ${forbiddenRoutes}`);
    console.log(`Forbidden routes have been logged to: ${FORBIDDEN_LOG}`);
    
  } catch (error) {
    console.error(`Error reading routes file: ${error.message}`);
  }
}

// Run the check
checkRoutes(); 