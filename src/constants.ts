import { GoogleDriveSettings } from "./types";

const DpiDropdownOptions = [
    { label: "75", value: "75" },
    { label: "100", value: "100" },
    { label: "150", value: "150" },
    { label: "200", value: "200" },
    { label: "300", value: "300" },
    { label: "400", value: "400" },
    { label: "600", value: "600" },
    { label: "800", value: "800" },
    { label: "1200", value: "1200" },
    { label: "2400", value: "2400" },
    { label: "4800", value: "4800" }
]

const ScannerColorDropDownOptions = [
    { label: "Color", value: "color" },
    { label: "Grayscale", value: "gray" },
    { label: "Black & White", value: "bw" }
]

const pageSizeDropdownOptions = [
    { label: '5', value: '5' },
    { label: '10', value: '10' },
    { label: '20', value: '20' },
    { label: '50', value: '50' },
    { label: '100', value: '100' },
    { label: 'All', value: 'All' }
]

const SortDropDownOptions = [
    { label: 'Newest First', value: 'Newest First' },
    { label: 'Oldest First', value: 'Oldest First' },
    { label: 'A-Z', value: 'A-Z' },
    { label: 'Z-A', value: 'Z-A' }
];

const GoogleDriveSettingsDefault: GoogleDriveSettings = {
    enabled: false,
    auto_backup: false,
    backup_time: '',
    folder_id: '',
    last_backup: ''
}

export { DpiDropdownOptions, pageSizeDropdownOptions, ScannerColorDropDownOptions as ScannerColorDropDown, SortDropDownOptions, GoogleDriveSettingsDefault };
