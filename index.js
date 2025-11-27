import axios from 'axios';
import fs from 'fs';

const BITRIX_WEBHOOK_URL = 'https://xxxxx.bitrix24.by/rest/xxxxx/xxxxx/'; 
const GOAL_COUNT = 10000;

async function fetchCompanies() {
    let allCompanies = [];
    let start = 0;
    let hasMore = true;
    let requestCount = 0;

    console.log(`Начинаем загрузку ${GOAL_COUNT} компаний...`);

    try {
        while (hasMore && allCompanies.length < GOAL_COUNT) {
            const response = await axios.get(`${BITRIX_WEBHOOK_URL}crm.company.list`, {
                params: {
                    start: start,
                    select: ['ID', 'TITLE', 'COMPANY_TYPE'] 
                }
            });

            const data = response.data;

            if (data.result && Array.isArray(data.result)) {
                allCompanies = allCompanies.concat(data.result);
                requestCount++;
                
                if (requestCount % 5 === 0) {
                    console.log(`Загружено: ${allCompanies.length} компаний...`);
                }
            }

            if (data.next && allCompanies.length < GOAL_COUNT) {
                start = data.next;
            } else {
                hasMore = false;
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        const finalResult = allCompanies.slice(0, GOAL_COUNT);

        console.log(`\nГотово! Всего получено компаний: ${finalResult.length}`);
        
        fs.writeFileSync('result_companies.json', JSON.stringify(finalResult, null, 2));
        console.log('Результат сохранен в файл: result_companies.json');

    } catch (error) {
        console.error('Произошла ошибка:', error.response ? error.response.data : error.message);
    }
}

fetchCompanies();
