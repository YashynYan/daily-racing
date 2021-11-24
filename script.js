const API_ADDRESS = "http://52.13.73.117:8000/api/";
tracks = [];
selectedTrack = null;
selectedRace = null;

window.onload = () => {
  const currentDateBlock = document.getElementById("current-date");
  const currentDateRaceBar = document.getElementById("current-date-race-bar");
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
  currentDateRaceBar.innerText = `${new Intl.DateTimeFormat(
    "en-US",
    monthOption
  ).format(date)} ${new Date(date).getDate()}`;
  getTrackList();
};

async function getTrackList() {
  await fetch(`${API_ADDRESS}track-list/`, { keepalive: true })
    .then((response) => response.json())
    .then((data) => {
      tracks = data;

      populateTracksTable(tracks);
      if (selectedTrack === null) {
        setSelectedTrack(data[0].trackName);
      }
    });
  console.log(selectedTrack, tracks);
}

function populateTracksTable(tracks) {
  tracks.forEach((item) => {
    const tableRow = document.createElement("tr");
    tableRow.className = "table-row";
    tableRow.onclick = (e) => {
      setSelectedTrack(item.trackName);
    };

    const trackCell = document.createElement("td");
    trackCell.innerText = item.trackName;

    const raceCell = document.createElement("td");
    raceCell.className = "text-align-center";
    raceCell.innerText = item.totalRace || "NA";

    const mtpCell = document.createElement("td");
    mtpCell.className = "text-align-center";
    mtpCell.innerText = item.raceTime || "NA";

    tableRow.append(trackCell, raceCell, mtpCell);

    document.getElementById("races-table-body").append(tableRow);
  });
}

function setSelectedTrack(selectedTrackName) {
  selectedTrack = tracks.find((item) => item.trackName === selectedTrackName);
  document.getElementById("race-name").innerText = selectedTrack.trackName;

  document.getElementById("races-table-body").childNodes.forEach((child) => {
    if (
      child.firstChild?.innerText === selectedTrack.trackName &&
      !child.classList?.contains("selected-row")
    ) {
      child.classList.add("selected-row");
    } else if (
      child.firstChild?.innerText !== selectedTrack.trackName &&
      child.classList?.contains("selected-row")
    ) {
      child.classList.remove("selected-row");
    }
  });

  const raceSelect = document.getElementById("race-select");
  raceSelect.onchange = (e) => {
    fetchRaceDetails(e.target.value);
  };
  raceSelect.innerHTML = ""
  selectedTrack.raceDetails.forEach((race) => {
    const option = document.createElement("option");
    option.value = race.raceName.replace("Race ", "");
    option.innerText = race.raceName;
    if (option.value === selectedTrack.currentRace) {
      option.selected = true;
    }
    raceSelect.append(option);
  });
  const mtpBlock = document.getElementById("race-bar-mtp-block");
  mtpBlock.innerText = selectedTrack.raceTime;
  fetchRaceDetails(selectedTrack.currentRace);
}

async function fetchRaceDetails(raceNumber) {
  await fetch(
    `${API_ADDRESS}race-detail/?bris_code=${selectedTrack.brisCode}&race_number=${raceNumber}`,
    { keepalive: true, headers: { "Content-Type": "application/json" } }
  )
    .then((response) => response.json())
    .then((data) => {
      setSelectedRace(data);
    });
}

function setSelectedRace(race) {
  selectedRace = race;

  console.log(race);
  document.getElementById("race-distance").innerText = race.distance || "NA";
}
