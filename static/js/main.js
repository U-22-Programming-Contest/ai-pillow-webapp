// $(function() { ... }) は、HTMLの読み込みが完了したら中のコードを実行するという意味
$(function () {

    // --- 1. CSVデータのグラフ表示 ---
    const drawChart = () => {
        const $chartCanvas = $('#myChart'); // jQueryで要素を選択
        if ($chartCanvas.length === 0) return;

        // jQueryでdata属性からURLを取得
        const csvUrl = $chartCanvas.data('csv-url');

        // jQueryのAjax通信 (GET)
        $.get(csvUrl, (csvData) => {
            const rows = csvData.trim().split('\n').slice(1);
            const labels = [];
            const pressureData = [];
            const airAmountData = [];

            rows.forEach(row => {
                const [time, pressure, airAmount] = row.split(',');
                labels.push(time);
                pressureData.push(parseFloat(pressure));
                airAmountData.push(parseFloat(airAmount));
            });

            const ctx = $chartCanvas[0].getContext('2d');
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
        }).fail((error) => {
            console.error('グラフ描画エラー:', error);
        });
    };

    // --- 2. 枕セグメントのクリックとデータ送信 ---
    const setupSegmentClick = () => {
        const $segmentsContainer = $('#pillow-segments');
        if ($segmentsContainer.length === 0) return;

        const sendDataUrl = $segmentsContainer.data('send-url');

        // jQueryのイベント委任 (より簡潔)
        // #pillow-segments の中の .segment がクリックされた時だけ実行
        $segmentsContainer.on('click', '.segment', function () {
            const segmentNumber = $(this).data('segment'); // クリックされた要素のdata属性を取得

            // jQueryのAjax通信 (POST)
            $.ajax({
                url: sendDataUrl,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ segment: segmentNumber })
            })
                .done((result) => {
                    console.log('サーバーからの応答:', result);
                    alert(`セグメント ${result.received_data} のデータを送信しました。`);
                })
                .fail((error) => {
                    console.error('データ送信エラー:', error);
                    alert('データの送信に失敗しました。');
                });
        });
    };

    // 各関数を実行
    drawChart();
    setupSegmentClick();
});