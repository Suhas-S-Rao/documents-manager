import { execFile } from 'node:child_process';
interface properties {
    color: "color" | "gray" | "bw";
    dpi: 75 | 100 | 150 | 200 | 300 | 400 | 600 | 800 | 1200 | 2400 | 4800;
    autoCrop: boolean;
    autoDeskew: boolean;
    area: Area;
}

interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
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
            id = $device.DeviceID
            name = $device.Properties.Item("Name").Value
            status = "online"
        }
    }
    catch {
        $result += @{
            id = $device.DeviceID
            name = $device.Properties.Item("Name").Value
            status = "offline"
        }
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

}

const scanDocument = async ({
    dpi = 300,
    color = 'color',
    autoCrop = false,
    autoDeskew = false,
    area = {
        x: 0,
        y: 0,
        width: 2480,
        height: 3508
    }
}: properties) => {
    const script = `
                    $manager = New-Object -ComObject WIA.DeviceManager
                    $deviceInfo = $manager.DeviceInfos.Item(1)
                    $device = $deviceInfo.Connect()
                    $item = $device.Items.Item(1)
                    # DPI
                    $item.Properties.Item("6147").Value = ${dpi}
                    $item.Properties.Item("6148").Value = ${dpi}
                    $item.Properties.Item("6146").Value = ${colorValue[color]}  
                    $item.Properties.Item("6159").Value = ${autoCrop};
                    $item.Properties.Item("6158").Value = ${autoDeskew};
                    $item.Properties.Item("6149").Value = ${area.x};
                    $item.Properties.Item("6150").Value = ${area.y};
                    $item.Properties.Item("6151").Value = ${area.width};
                    $item.Properties.Item("6152").Value = ${area.height};                  
                    $image = $device.Items.Item(1).Transfer()
                    $file = "$env:TEMP\\scan_${Date.now()}.jpg"
                    $image.SaveFile($file)
                    $file
                `;
    const output = await runPowerShell(script);
    return output.trim();
}
export { getScannersList, scanDocument };