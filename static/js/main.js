document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CSVデータのグラフ表示 ---
    const drawChart = async () => {
        const chartCanvas = document.getElementById('myChart');
        if (!chartCanvas) return;

        // HTMLのdata属性からCSVファイルのURLを取得
        const csvUrl = chartCanvas.dataset.csvUrl;

        try {
            const response = await fetch(csvUrl);
            if (!response.ok) throw new Error('CSVファイルの読み込みに失敗しました。');

            const csvData = await response.text();

            const rows = csvData.trim().split('\n').slice(1); // ヘッダー行をスキップ
            const labels = [];
            const pressureData = [];
            const airAmountData = [];

            rows.forEach(row => {
                const [time, pressure, airAmount] = row.split(',');
                labels.push(time);
                pressureData.push(parseFloat(pressure));
                airAmountData.push(parseFloat(airAmount));
            });

            const ctx = chartCanvas.getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: '圧力',
                        data: pressureData,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        tension: 0.1
                    }, {
                        label: '空気圧量',
                        data: airAmountData,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        tension: 0.1
                    }]
                }
            });
        } catch (error) {
            console.error('グラフ描画エラー:', error);
        }
    };

    // --- 2. 枕セグメントのクリックとデータ送信 ---
    const setupSegmentClick = () => {
        const segmentsContainer = document.getElementById('pillow-segments');
        if (!segmentsContainer) return;

        // HTMLのdata属性からデータ送信先のURLを取得
        const sendDataUrl = segmentsContainer.dataset.sendUrl;

        segmentsContainer.addEventListener('click', async (event) => {
            if (event.target.classList.contains('segment')) {
                const segmentNumber = event.target.dataset.segment;

                try {
                    const response = await fetch(sendDataUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ segment: segmentNumber }),
                    });

                    if (!response.ok) throw new Error('サーバーへのデータ送信に失敗しました。');

                    const result = await response.json();
                    console.log('サーバーからの応答:', result);
                    alert(`セグメント ${result.received_data} のデータを送信しました。`);

                } catch (error) {
                    console.error('データ送信エラー:', error);
                    alert('データの送信に失敗しました。');
                }
            }
        });
    };

    // 各関数を実行
    drawChart();
    setupSegmentClick();
});