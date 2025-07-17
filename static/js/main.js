// $(function () {
//     const drawCharts = () => {
//         const $pressureCanvas = $('#pressureChart');
//         const $airPressureCanvas = $('#airPressureChart');
//         if ($pressureCanvas.length === 0 || $airPressureCanvas.length === 0) return;

//         const csvUrl = $pressureCanvas.data('csv-url');

//         $.get(csvUrl, (csvData) => {
//             const rows = csvData.trim().split('\n');
//             const headers = rows[0].split(',');
//             const dataRows = rows.slice(1);

//             // データを準備
//             const labels = [];
//             const pressureDatasets = [];
//             const airPressureDatasets = [];

//             // ヘッダーを元にデータセットの骨格を作成
//             headers.forEach((header, i) => {
//                 const dataset = {
//                     label: header,
//                     data: [],
//                     tension: 0.1,
//                     borderWidth: 2
//                 };
//                 if (header.startsWith('Pressure')) {
//                     pressureDatasets.push(dataset);
//                 } else if (header.startsWith('AirPressure')) {
//                     airPressureDatasets.push(dataset);
//                 }
//             });

//             // CSVの各行のデータを振り分ける
//             dataRows.forEach((row, index) => {
//                 labels.push(index + 1);
//                 const values = row.split(',');
//                 let pIndex = 0;
//                 let aIndex = 0;
//                 values.forEach((value, i) => {
//                     if (headers[i].startsWith('Pressure')) {
//                         pressureDatasets[pIndex].data.push(parseFloat(value));
//                         pIndex++;
//                     } else if (headers[i].startsWith('AirPressure')) {
//                         airPressureDatasets[aIndex].data.push(parseFloat(value));
//                         aIndex++;
//                     }
//                 });
//             });

//             // 圧力グラフを描画
//             const pressureCtx = $pressureCanvas[0].getContext('2d');
//             new Chart(pressureCtx, {
//                 type: 'line',
//                 data: { labels: labels, datasets: pressureDatasets },
//                 options: {
//                     responsive: true,
//                     plugins: { legend: { position: 'top' } }
//                 }
//             });

//             // 空気圧グラフを描画
//             const airPressureCtx = $airPressureCanvas[0].getContext('2d');
//             new Chart(airPressureCtx, {
//                 type: 'line',
//                 data: { labels: labels, datasets: airPressureDatasets },
//                 options: {
//                     responsive: true,
//                     plugins: { legend: { position: 'top' } }
//                 }
//             });

//         }).fail((error) => console.error('グラフ描画エラー:', error));
//     };

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

            const labels = [];
            const pressureDatasets = [];
            const airPressureDatasets = [];

            // グラフの色を定義しておく
            const colors = [
                'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)',
                'rgba(99, 255, 132, 1)', 'rgba(162, 54, 235, 1)',
                'rgba(206, 255, 86, 1)', 'rgba(192, 75, 192, 1)'
            ];

            headers.forEach((header, i) => {
                const color = colors[i % colors.length]; // 色を順番に割り当て
                const dataset = {
                    // 凡例やツールチップに表示される線の名前
                    label: header,
                    // グラフにプロットする数値データを入れる配列
                    data: [],
                    // 線の色
                    borderColor: color,
                    // 線の下を塗りつぶす場合の色（線の色を少し透明にしたもの）
                    backgroundColor: color.replace('1)', '0.2)'),
                    // 線の下を塗りつぶすかどうか (true/false)
                    fill: false,
                    // 線の曲がり具合 (0は真っ直ぐ)
                    tension: 0.1,
                    // 線の太さ（ピクセル）
                    borderWidth: 2,
                    // データ点の円の半径（サイズ）
                    pointRadius: 3,
                    // データ点の塗りつぶし色
                    pointBackgroundColor: color,
                };

                if (header.startsWith('Pressure')) {
                    pressureDatasets.push(dataset);
                } else if (header.startsWith('AirPressure')) {
                    airPressureDatasets.push(dataset);
                }
            });

            dataRows.forEach((row) => {
                const values = row.split(',');
                // 1列目の値が空か数値でなければ、その行はスキップ
                if (!values[0] || isNaN(parseFloat(values[0]))) {
                    return;
                }

                // 有効な行だけをカウントしてラベルを追加
                labels.push(labels.length);

                let pIndex = 0;
                let aIndex = 0;
                values.forEach((value, i) => {
                    if (headers[i].startsWith('Pressure')) {
                        pressureDatasets[pIndex++].data.push(parseFloat(value));
                    } else if (headers[i].startsWith('AirPressure')) {
                        airPressureDatasets[aIndex++].data.push(parseFloat(value));
                    }
                });
            });

            // --- 圧力グラフの描画 (オプションを追加) ---
            const pressureCtx = $pressureCanvas[0].getContext('2d');
            new Chart(pressureCtx, {
                type: 'line',
                data: { labels: labels, datasets: pressureDatasets },
                options: {
                    responsive: true, // レスポンシブ対応
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: '時間'
                            },
                            ticks: {
                                maxTicksLimit: 10
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: '圧力'
                            }
                        }
                    },
                    plugins: {
                        legend: { // 凡例（ラベル）の設定
                            position: 'top',
                            labels: {
                                font: { size: 12 }
                            }
                        },
                        title: { // グラフタイトルの設定
                            display: true,
                            text: '圧力データ',
                            font: { size: 16 }
                        }
                    }
                }
            });

            // --- 空気圧グラフの描画 (オプションを追加) ---
            const airPressureCtx = $airPressureCanvas[0].getContext('2d');
            new Chart(airPressureCtx, {
                type: 'line',
                data: { labels: labels, datasets: airPressureDatasets },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: '時間'
                            },
                            ticks: {
                                maxTicksLimit: 10
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: '空気圧'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: { size: 12 }
                            }
                        },
                        title: {
                            display: true,
                            text: '空気圧データ',
                            font: { size: 16 }
                        }
                    }
                }
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