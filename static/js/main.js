$(function () {
    const drawChart = () => {
        const $chartCanvas = $('#myChart');
        if ($chartCanvas.length === 0) return;

        const csvUrl = $chartCanvas.data('csv-url');

        $.get(csvUrl, (csvData) => {
            const rows = csvData.trim().split('\n');

            // 1行目のヘッダーを取得し、グラフのラベルとして使用
            const headers = rows[0].split(',').slice(0, 10); // Pressure1-4, AirPressure1-6 の10列分

            // 各列のデータを保存する配列を準備
            const datasets = headers.map(header => ({
                label: header,
                data: [],
                tension: 0.1,
                borderWidth: 2, // 線の太さを少し太くする
                hidden: true, // 最初は非表示にしておく
            }));

            // 最初の2つ（Pressure1, AirPressure1）だけ表示状態にする
            if (datasets.length > 0) datasets[0].hidden = false;
            if (datasets.length > 4) datasets[4].hidden = false;


            const labels = [];
            const dataRows = rows.slice(1); // 2行目以降のデータ行

            dataRows.forEach((row, index) => {
                // 行番号をラベルとして使用
                labels.push(index + 1);

                const values = row.split(',');

                // 最初の10列のデータをそれぞれのdatasetに追加
                for (let i = 0; i < headers.length; i++) {
                    datasets[i].data.push(parseFloat(values[i]));
                }
            });

            const ctx = $chartCanvas[0].getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets // 作成したデータセットの配列を渡す
                },
                options: {
                    // 凡例（ラベル）をクリックして表示・非表示を切り替えられる
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'データ行番号 (時間経過)'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: '圧力'
                            }
                        }
                    }
                }
            });
        }).fail((error) => {
            console.error('グラフ描画エラー:', error);
        });
    };

    // --- 枕セグメントのクリック処理 (変更なし) ---
    const setupSegmentClick = () => {
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
                .done((result) => {
                    console.log('サーバーからの応答:', result);
                    alert(`セグメント ${result.received_data} のデータを送信しました。`);
                })
                .fail((error) => {
                    console.error('データ送信エラー:', error);
                });
        });
    };

    drawChart();
    setupSegmentClick();
});