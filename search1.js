let parsedData = null;

// CSVファイル読み込み
document.getElementById('csvFile').addEventListener('change', function (e) {
  const file = e.target.files[0];
  Papa.parse(file, {
    complete: function(results) {
      parsedData = results.data;
      alert("CSV読み込み完了");
    }
  });
});

// 描画ボタンイベント
document.getElementById('drawButton').addEventListener('click', drawPlot);

function drawPlot() {
  const geneName = document.getElementById("geneName").value.trim();
  if (!parsedData) {
    alert("先にCSVファイルを読み込んでください。");
    return;
  }

  // ヘッダーとメタ情報
  const tissueRow = parsedData[2];   // 3行目 (0-indexed)
  const lineRow = parsedData[4];     // 5行目
  const geneRows = parsedData.slice(6);  // 7行目以降が遺伝子データ

  // 遺伝子行を検索
  const geneRow = geneRows.find(row => row[0] === geneName);
  if (!geneRow) {
    alert("指定された遺伝子が見つかりません。");
    return;
  }

  const groups = {}; // { line_tissue: [発現値, ...] }

  for (let col = 1; col < geneRow.length; col++) {
    const tissue = tissueRow[col];
    const line = lineRow[col];
    const key = `${line}_${tissue}`;
    const value = parseFloat(geneRow[col]);

    if (!groups[key]) groups[key] = [];
    if (!isNaN(value)) groups[key].push(value);
  }

  const traces = Object.entries(groups).map(([group, values]) => ({
    type: 'violin',
    y: values,
    name: group,
    box: { visible: true },
    meanline: { visible: true }
  }));

  Plotly.newPlot('plot', traces, {
    title: `${geneName} の発現量（系統×組織別）`,
    yaxis: { title: '発現量' },
    xaxis: { tickangle: -45 },
    violingap: 0,
    violinmode: 'group'
  });
}

