// import { Chart } from "@/components/ui/chart"

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
                const color = colors[i % colors.length];
                // ラベル名を短縮する (例: "Pressure1" -> "P1")
                const shortLabel = header.replace('Pressure', 'P').replace('Air', 'A');
                const dataset = {
                    label: header,
                    data: [],
                    borderColor: color,
                    backgroundColor: color.replace('1)', '0.2)'),
                    fill: false,
                    tension: 0.1,
                    borderWidth: 2,
                    pointRadius: 1.5,
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
                        pressureDatasets[pIndex++].data.push(parseFloat(value) || 0);
                    } else if (headers[i].startsWith('AirPressure')) {
                        airPressureDatasets[aIndex++].data.push(parseFloat(value) || 0);
                    }
                });
            });

            // 圧力グラフの描画
            const pressureCtx = $pressureCanvas[0].getContext('2d');
            new Chart(pressureCtx, {
                type: 'line',
                data: { labels: labels, datasets: pressureDatasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // 追加：アスペクト比を固定しない
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: '時間',
                                font: { size: 14 }
                            },
                            ticks: {
                                maxTicksLimit: 10
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: '圧力',
                                font: { size: 14 }
                            },
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: { size: 12 },
                                usePointStyle: true // 追加：点のスタイルを使用
                            }
                        },
                        title: {
                            display: true,
                            text: '圧力データ',
                            font: { size: 16, weight: 'bold' }
                        },
                    },
                    interaction: { // 追加：インタラクションの設定
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    }
                }
            });

            // 空気圧グラフの描画
            const airPressureCtx = $airPressureCanvas[0].getContext('2d');
            new Chart(airPressureCtx, {
                type: 'line',
                data: { labels: labels, datasets: airPressureDatasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: '時間',
                                font: { size: 14 }
                            },
                            ticks: {
                                maxTicksLimit: 10
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: '空気圧',
                                font: { size: 14 }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: { size: 12 },
                                usePointStyle: true
                            }
                        },
                        title: {
                            display: true,
                            text: '空気圧データ',
                            font: { size: 16, weight: 'bold' }
                        },
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    }
                }
            });

        }).fail((error) => {
            console.error('グラフ描画エラー:', error);
            // エラー時にユーザーに分かりやすいメッセージを表示
            $('#pressureChart').parent().append('<p class="error-message">グラフの読み込みに失敗しました。</p>');
            $('#airPressureChart').parent().append('<p class="error-message">グラフの読み込みに失敗しました。</p>');
        });
    };

    const setupSegmentClick = () => {
        const $segmentsContainer = $('#pillow-segments');
        if ($segmentsContainer.length === 0) return;

        // data-send-url属性がない場合のフォールバック
        const sendDataUrl = $segmentsContainer.data('send-url') || '/receive_data';

        $segmentsContainer.on('click', '.segment', function () {
            const $segment = $(this);
            const segmentNumber = $segment.data('segment');

            // セグメントの状態をトグル
            $segment.toggleClass('active');

            // 視覚的フィードバック（一時的に無効化）
            $segment.prop('disabled', true);

            $.ajax({
                url: sendDataUrl,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    segment: segmentNumber,
                    active: $segment.hasClass('active')
                }),
                timeout: 5000 // 5秒でタイムアウト
            })
                .done((result) => {
                    console.log(`セグメント ${segmentNumber} のデータを送信しました:`, result);
                    // 成功時の視覚的フィードバック（オプション）
                    $segment.addClass('success-flash');
                    setTimeout(() => $segment.removeClass('success-flash'), 300);
                })
                .fail((error) => {
                    console.error('データの送信に失敗しました:', error);
                    // エラー時はアクティブ状態を元に戻す
                    $segment.toggleClass('active');
                    // エラーの視覚的フィードバック
                    $segment.addClass('error-flash');
                    setTimeout(() => $segment.removeClass('error-flash'), 300);
                })
                .always(() => {
                    // 常に実行：セグメントを再度有効化
                    $segment.prop('disabled', false);
                });
        });
    };

    // 初期化
    drawCharts();
    setupSegmentClick();
});