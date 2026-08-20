import { execFile } from 'node:child_process';

interface properties {
    color: "color" | "gray" | "bw";
    dpi: 75 | 100 | 150 | 200 | 300 | 400 | 600 | 800 | 1200 | 2400 | 4800;
}

const colorValue: Record<properties["color"], number> = {
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
}

const getScannersList = async () => {
    const script = `
            $manager = New-Object -ComObject WIA.DeviceManager
            $result = @()
            foreach($device in $manager.DeviceInfos)
            {
                try {
                    $device.Connect() | Out-Null
                    $result += @{
                        scanner_id = $device.Properties.Item("Description").Value
                        scanner_name = $device.Properties.Item("Name").Value
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

const scanDocument = async ({ dpi = 300, color = 'color' }: properties) => {
    const script = `
                    $manager = New-Object -ComObject WIA.DeviceManager
                    $deviceInfo = $manager.DeviceInfos.Item(1)
                    $device = $deviceInfo.Connect()
                    $item = $device.Items.Item(1)
                    $item.Properties.Item("6147").Value = ${dpi}
                    $item.Properties.Item("6148").Value = ${dpi}
                    $item.Properties.Item("6146").Value = ${colorValue[color]}         
                    $image = $device.Items.Item(1).Transfer()
                    $file = "$env:TEMP\\scan_${Date.now()}.jpg"
                    $image.SaveFile($file)
                    $file
                `;
    const output = await runPowerShell(script);
    return output.trim();
}
export { getScannersList, scanDocument };