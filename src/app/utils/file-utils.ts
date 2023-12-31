export function readFile(file: File) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = () => {
            const bytes = new Uint8Array(fileReader.result as ArrayBuffer);
            resolve(bytes);
        }
        fileReader.onerror = reject;
        fileReader.readAsArrayBuffer(file);
    });
}

