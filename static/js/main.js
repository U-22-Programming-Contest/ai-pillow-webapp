$(function () {
    const drawCharts = () => {
        const $pressureCanvas = $('#pressureChart');
        const $airPressureCanvas = $('#airPressureChart');
        if ($pressureCanvas.length === 0 || $airPressureCanvas.length === 0) return;

        const csvUrl = $pressureCanvas.data('csv-url');

        $.get(csvUrl, (csvData) => {
            const rows = csvData.trim().split('\n');
            const headers = rows[0].split(',');
            const dataRows = rows.slice(1);

            // データを準備
            const labels = [];
            const pressureDatasets = [];
            const airPressureDatasets = [];

            // ヘッダーを元にデータセットの骨格を作成
            headers.forEach((header, i) => {
                const dataset = {
                    label: header,
                    data: [],
                    tension: 0.1,
                    borderWidth: 2
                };
                if (header.startsWith('Pressure')) {
                    pressureDatasets.push(dataset);
                } else if (header.startsWith('AirPressure')) {
                    airPressureDatasets.push(dataset);
                }
            });

            // CSVの各行のデータを振り分ける
            dataRows.forEach((row, index) => {
                labels.push(index + 1);
                const values = row.split(',');
                let pIndex = 0;
                let aIndex = 0;
                values.forEach((value, i) => {
                    if (headers[i].startsWith('Pressure')) {
                        pressureDatasets[pIndex].data.push(parseFloat(value));
                        pIndex++;
                    } else if (headers[i].startsWith('AirPressure')) {
                        airPressureDatasets[aIndex].data.push(parseFloat(value));
                        aIndex++;
                    }
                });
            });

            // 圧力グラフを描画
            const pressureCtx = $pressureCanvas[0].getContext('2d');
            new Chart(pressureCtx, {
                type: 'line',
                data: { labels: labels, datasets: pressureDatasets },
                options: { plugins: { legend: { position: 'top' } } }
            });

            // 空気圧グラフを描画
            const airPressureCtx = $airPressureCanvas[0].getContext('2d');
            new Chart(airPressureCtx, {
                type: 'line',
                data: { labels: labels, datasets: airPressureDatasets },
                options: { plugins: { legend: { position: 'top' } } }
            });

        }).fail((error) => console.error('グラフ描画エラー:', error));
    };

    const setupSegmentClick = () => {
        // (省略) この部分は変更なし
        const $segmentsContainer = $('#pillow-segments');
        if ($segmentsContainer.length === 0) return;
        const sendDataUrl = $segmentsContainer.data('send-url');
        $segmentsContainer.on('click', '.segment', function () {
            const segmentNumber = $(this).data('segment');
            $.ajax({
                url: sendDataUrl,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ segment: segmentNumber })
            })
                .done((result) => alert(`セグメント ${result.received_data} のデータを送信しました。`))
                .fail((error) => alert('データの送信に失敗しました。'));
        });
    };

    drawCharts();
    setupSegmentClick();
});