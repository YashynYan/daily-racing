const API_ADDRESS = "http://52.13.73.117:8000/api/";
selectedRace = null;
tracks = [];

window.onload = () => {
  const currentDateBlock = document.getElementById("current-date");
  const date = Date.now();
  const weekdayOption = { weekday: "long" };
  const monthOption = { month: "short" };
  const formatedDate = `${new Intl.DateTimeFormat(
    "en-US",
    weekdayOption
  ).format(date)}, ${new Intl.DateTimeFormat("en-US", monthOption).format(
    date
  )} ${new Date(date).getDate()}`;

  currentDateBlock.innerText = formatedDate;
  getTrackList();
};




async function getTrackList() {
  await fetch(`${API_ADDRESS}track-list/`, { keepalive: true })
    .then((response) => response.json())
    .then((data) => {
      tracks = data;
      if (selectedRace === null) {
        selectedRace = data[0];
      }
      populateTracksTable(tracks)
    });
  console.log(selectedRace, tracks);
}

function populateTracksTable(tracks) {
  tracks.forEach((item) => {
    const tableRow = document.createElement("tr");
    tableRow.className = "rounded-badge";

    const trackCell = document.createElement("td");
    trackCell.innerText = item.trackName;

    const raceCell = document.createElement("td");
    raceCell.innerText = item.totalRace || 'NA';

    const mtpCell = document.createElement("td");
    mtpCell.innerText = item.raceTime || 'NA';

    tableRow.append(trackCell, raceCell, mtpCell);

    document.getElementById("races-table-body").append(tableRow);
  });
}
