import os from 'os';
import path from 'path';

export function getBlenderPath(): string {
  const platform = os.platform();
  
  switch (platform) {
    case 'darwin': // macOS
      return '/Applications/Blender.app/Contents/MacOS/Blender';
    case 'win32': // Windows
      return 'C:\\Program Files\\Blender Foundation\\Blender 4.0\\blender.exe';
    case 'linux': // Linux
      return '/usr/bin/blender';
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
