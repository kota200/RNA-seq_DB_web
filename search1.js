let parsedData = null;

// CSV読み込み処理（既にある前提）
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('PM_TPM_matrix_t_mod_for_practice.csv').addEventListener('change', function (e) {
    const file = e.target.files[0];
    Papa.parse(file, {
      complete: function(results) {
        parsedData = results.data;
        alert("CSV読み込み完了");
      }
    });
  });

  // 検索ボタンクリック時の処理
  document.getElementById('searchButton').addEventListener('click', function () {
    const geneName = document.getElementById("search").value.trim();
    if (!parsedData) {
      alert("CSVを先に読み込んでください。");
      return;
    }
    drawPlot(geneName);
  });
});

function drawPlot(geneName) {
  const tissueRow = parsedData[2];   // 組織 (3行目)
  const lineRow = parsedData[4];     // 系統 (5行目)
  const geneRows = parsedData.slice(6);  // 遺伝子データ

  const geneRow = geneRows.find(row => row[0] === geneName);
  if (!geneRow) {
    alert(`遺伝子 ${geneName} が見つかりません`);
    return;
  }

  const groups = {};
  for (let i = 1; i < geneRow.length; i++) {
    const tissue = tissueRow[i];
    const line = lineRow[i];
    const key = `${line}_${tissue}`;
    const value = parseFloat(geneRow[i]);

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
