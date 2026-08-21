import { execFile } from 'node:child_process';
import { ScannerSettings } from '../models';

interface properties {
    color: 'color' | 'gray' | 'bw';
    dpi: 75 | 100 | 150 | 200 | 300 | 400 | 600 | 800 | 1200 | 2400 | 4800;
}

const colorValue: Record<properties['color'], number> = {
    color: 1,
    gray: 2,
    bw: 4
};

const runPowerShell = (script: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        execFile('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script], (error, stdout) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout);
        });
    });
};

const getScannersList = async () => {
    const script = `
            $manager = New-Object -ComObject WIA.DeviceManager
            $result = @()
            foreach($deviceInfo in $manager.DeviceInfos)
            {
                try {
                    $scannerId = $deviceInfo.Properties.Item("Description").Value
                    $scannerName = $deviceInfo.Properties.Item("Name").Value
                    $maxDpi = 300
                    try {
                        $device = $deviceInfo.Connect()
                        $horizontalDpi = $device.Properties.Item("Horizontal Optical Resolution").Value
                        $verticalDpi = $device.Properties.Item("Vertical Optical Resolution").Value
                        $maxDpi = [Math]::Min($horizontalDpi, $verticalDpi)
                    }
                    catch {
                    }
                    $result += @{
                        scanner_id = $scannerId
                        scanner_name = $scannerName
                        max_dpi = $maxDpi
                    }
                }
                catch {
                }
            }
            $result | ConvertTo-Json
            `;

    const output = await runPowerShell(script);

    if (!output.trim()) {
        return [];
    }
    const data = JSON.parse(output);
    return Array.isArray(data) ? data : [data];
};

const scanDocument = async (scannerSetting: ScannerSettings) => {
    const script = `
                try {
                    $manager = New-Object -ComObject WIA.DeviceManager
                    $deviceInfo = $manager.DeviceInfos | Where-Object {
                        $_.Properties.Item("Description").Value -eq '${scannerSetting.scanner_id}'
                    } | Select-Object -First 1
                    if ($null -eq $deviceInfo) {
                        throw "SCANNER_NOT_FOUND"
                    }
                    $device = $deviceInfo.Connect()
                    $item = $device.Items.Item(1)
                    $item.Properties.Item("6147").Value = ${scannerSetting.dpi}
                    $item.Properties.Item("6148").Value = ${scannerSetting.dpi}
                    $item.Properties.Item("6146").Value = ${colorValue[scannerSetting.color_mode]}
                    $image = $item.Transfer()
                    $image.FormatID = "{B96B3CAE-0728-11D3-9D7B-0000F81EF32E}"
                    $file = "$env:TEMP\\scan_${Date.now()}.jpg"
                    $image.SaveFile($file)
                    Write-Host $file
                }
                catch {
                    Write-Error $_.Exception.Message
                    exit 1
                }
                `;
    try {
        const file = await runPowerShell(script);
        return file.trim();
    } catch (error: any) {
        throw new Error('Scanner disconnected or unavailable');
    }
};

export { getScannersList, scanDocument };
