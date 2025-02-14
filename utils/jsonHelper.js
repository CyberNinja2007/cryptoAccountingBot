import fs from 'fs';

/**
 * Читает JSON из файла по указанному пути.
 *
 * @param {string} filePath Путь до файла.
 * @return {JSON|null} Результат чтения.
 */
export const readJsonFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        console.log('Успешно прочитан JSON файл')

        return JSON.parse(data);
    } catch (error) {
        console.error('Произошла ошибка при чтении JSON файла:', error.message);
        return null;
    }
};