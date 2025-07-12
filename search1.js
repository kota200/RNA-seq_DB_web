let parsedData = null;

// CSV読み込み
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('csvFile').addEventListener('change', function (e) {
    const file = e.target.files[0];
    Papa.parse(file, {
      complete: function(results) {
        parsedData = results.data;
        alert("CSV読み込み完了");
      }
    });
  });

  // ボタンクリック時にプロットを描画
  document.getElementById('searchButton').addEventListener('click', () => {
    const geneName = document.getElementById("search").value.trim();
    if (!parsedData) {
      alert("先にCSVファイルを読み込んでください。");
      return;
    }
    drawPlot(geneName);
  });
});

function drawPlot(geneName) {
  const tissueRow = parsedData[2];   // 組織情報 (3行目)
  const lineRow = parsedData[4];     // 系統情報 (5行目)
  const geneRows = parsedData.slice(6); // 遺伝子行

  const geneRow = geneRows.find(row => row[0] === geneName);
  if (!geneRow) {
    alert("指定された遺伝子が見つかりません。");
    return;
  }

  const groups = {};
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
