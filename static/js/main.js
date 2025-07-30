$(function () {
    const chartControls = {
        pressureChart: {
            instance: null, currentIndex: 0, isPlaying: false, updateInterval: null, datasets: []
        },
        airPressureChart: {
            instance: null, currentIndex: 0, isPlaying: false, updateInterval: null, datasets: []
        }
    };

    let createdCharts = [];
    let fullDataRows = [];
    let headers = [];
    const UPDATE_SPEED = 200;
    const MAX_DATA_POINTS = 10;

    const drawCharts = () => {
        const csvUrl = $('#pressureChart').data('csv-url');
        if (!csvUrl) return;

        $.get(csvUrl, (csvData) => {
            const rows = csvData.trim().split('\n');
            headers = rows[0].split(',');
            fullDataRows = rows.slice(1);
            initializeEmptyCharts();
        }).fail((error) => console.error('グラフ描画エラー:', error));
    };

    const initializeEmptyCharts = () => {
        const colors = ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'];

        headers.forEach((header, i) => {
            const color = colors[i % colors.length];
            const dataset = { label: header, data: [], borderColor: color, backgroundColor: color.replace('1)', '0.2)'), fill: false, tension: 0.1, borderWidth: 2, pointRadius: 1.5 };
            if (header.startsWith('Pressure')) {
                chartControls.pressureChart.datasets.push(dataset);
            } else if (header.startsWith('AirPressure')) {
                chartControls.airPressureChart.datasets.push(dataset);
            }
        });

        const chartOptions = (yAxisTitle, chartTitle) => ({
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
            scales: {
                x: { title: { display: true, text: '時間 (s)', font: { size: 14 } } },
                y: { title: { display: true, text: yAxisTitle, font: { size: 14 } }, beginAtZero: true }
            },
            plugins: {
                legend: {
                    position: 'top', labels: { font: { size: 12 }, usePointStyle: true },
                },
                title: { display: true, text: chartTitle, font: { size: 16, weight: 'bold' } },
                tooltip: {
                    mode: 'index', intersect: false,
                }
            }
        });

        const pressureCtx = $('#pressureChart')[0].getContext('2d');
        chartControls.pressureChart.instance = new Chart(pressureCtx, { type: 'line', data: { labels: [], datasets: chartControls.pressureChart.datasets }, options: chartOptions('圧力 (kg)', '圧力データ') });
        createdCharts.push(chartControls.pressureChart.instance);

        const airPressureCtx = $('#airPressureChart')[0].getContext('2d');
        chartControls.airPressureChart.instance = new Chart(airPressureCtx, { type: 'line', data: { labels: [], datasets: chartControls.airPressureChart.datasets }, options: chartOptions('空気圧 (psi)', '空気圧データ') });
        createdCharts.push(chartControls.airPressureChart.instance);
    };

    const updateChartStepByStep = (chartId) => {
        const control = chartControls[chartId];
        if (control.currentIndex >= fullDataRows.length) {
            control.currentIndex = 0;
        }

        const row = fullDataRows[control.currentIndex];
        const values = row.split(',');
        const chart = control.instance;

        chart.data.labels.push(control.currentIndex);
        if (chart.data.labels.length > MAX_DATA_POINTS) {
            chart.data.labels.shift();
        }

        let pIndex = 0;
        let aIndex = 0;
        headers.forEach((header, i) => {
            const value = values[i];
            if (header.startsWith('Pressure') && chartId === 'pressureChart') {
                const dataArray = chart.data.datasets[pIndex].data;
                dataArray.push((parseFloat(value) || 0) / 100);
                if (dataArray.length > MAX_DATA_POINTS) dataArray.shift();
                pIndex++;
            } else if (header.startsWith('AirPressure') && chartId === 'airPressureChart') {
                const dataArray = chart.data.datasets[aIndex].data;
                dataArray.push(parseFloat(value) || 0);
                if (dataArray.length > MAX_DATA_POINTS) dataArray.shift();
                aIndex++;
            }
        });
        chart.update('none');
        control.currentIndex++;
    };

    const playPause = (chartId, forcePause = false) => {
        const control = chartControls[chartId];
        const $button = $(`#${chartId}`).closest('.chart-container').find('.playPauseBtn');

        if (control.isPlaying && !forcePause) {
            clearInterval(control.updateInterval);
            $button.text('再生');
        } else if (!control.isPlaying && !forcePause) {
            if (control.currentIndex >= fullDataRows.length) {
                stopAnimation(chartId);
            }
            control.updateInterval = setInterval(() => updateChartStepByStep(chartId), UPDATE_SPEED);
            $button.text('一時停止');
        } else {
            clearInterval(control.updateInterval);
            $button.text('再生');
        }
        control.isPlaying = forcePause ? false : !control.isPlaying;
    };

    const resetAnimation = (chartId) => {
        const control = chartControls[chartId];
        if (control.isPlaying) {
            playPause(chartId, true);
        }
        control.currentIndex = 0;
        control.instance.data.labels = [];
        control.instance.data.datasets.forEach(dataset => {
            dataset.data = [];
        });
        control.instance.update();
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
    const setupTooltipHiding = () => {
        $(document).on('click touchstart', function (event) {
            if (!$(event.target).closest('canvas').length) {
                createdCharts.forEach(chart => {
                    chart.tooltip.setActiveElements([], { x: 0, y: 0 });
                    chart.update();
                });
            }
        });
    };

    $('.playPauseBtn').on('click', function () {
        const chartId = $(this).closest('.chart-container').find('canvas').attr('id');
        playPause(chartId);
    });

    $('.resetBtn').on('click', function () {
        const chartId = $(this).closest('.chart-container').find('canvas').attr('id');
        resetAnimation(chartId);
    });

    // 初期化
    drawCharts();
    setupSegmentClick();
    setupTooltipHiding();
});