let parsedData = null;

// CSVファイル読み込みイベント
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

  const headers = parsedData[0];
  const sampleParts = parsedData[1];
  const cultivars = parsedData[2];

  const geneIndex = headers.indexOf(geneName);
  if (geneIndex === -1) {
    alert("指定された遺伝子が見つかりません。");
    return;
  }

  const groups = {}; // 品種_部位ごとにまとめる

  for (let i = 3; i < parsedData.length; i++) {
    const cultivar = cultivars[i];
    const part = sampleParts[i];
    const key = `${cultivar}_${part}`;
    const value = parseFloat(parsedData[i][geneIndex]);

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
    title: `${geneName} の発現量（品種×部位別）`,
    yaxis: { title: '発現量' },
    xaxis: { tickangle: -45 },
    violingap: 0,
    violinmode: 'group'
  });
}
