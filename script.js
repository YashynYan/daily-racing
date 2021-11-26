const API_ADDRESS = "http://52.13.73.117:8000/api/";
tracks = [];
selectedTrack = null;
selectedRace = null;
searchQuery = "";

const bulletColors = {
  red: "#FF4D4D",
  green: "#27AE60",
  yellow: "#F2C94C",
};

const countryCode = {
  auc: "AU",
  aus: "AU",
  sar: "USA",
  pim: "USA",
  op: "USA",
  mth: "USA",
  lrc: "USA",
  lrl: "USA",
  kee: "USA",
  haw: "USA",
  fg: "USA",
  dmr: "USA",
  ap: "USA",
  aqu: "USA",
  tam: "USA",
  ura: "JPN",
  oi: "JPN",
  bel: "USA",
  cd: "USA",
  sa: "USA",
  wo: "CA",
  hv: "HK",
  mnr: "USA",
  prx: "USA",
  gp: "USA",
  st: "HK",
  fex: "CA",
};

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
      } else {
        setSelectedTrack(selectedTrack.trackName);
      }
    });

  setTimeout(() => {
    getTrackList();
  }, 8000);
}

function populateTracksTable(tracks) {
  const raceTableBody = document.getElementById("races-table-body");
  raceTableBody.innerHTML = "";
  tracks
    .filter((track) =>
      track.trackName.toUpperCase().includes(searchQuery.toUpperCase())
    )
    .forEach((item, index, arr) => {
      const tableRow = document.createElement("tr");
      tableRow.className = "table-row";
      tableRow.onclick = (e) => {
        setSelectedTrack(item.trackName);
      };

      const trackCell = document.createElement("td");
      if(arr.length === index+1){
        trackCell.style.borderRadius = '0px 0px 0px 4px';
      }
      const trackBlock = document.createElement("div");
      trackBlock.className = "flex-row";
      const countryImage = document.createElement("img");
      countryImage.src = `./assets/icons/flags/${countryCode[
        item.brisCode
      ]?.toLowerCase()}.svg`;
      countryImage.className = "margin-right-8";
      trackBlock.append(countryImage, item.trackName);
      trackCell.append(trackBlock);

      const raceCell = document.createElement("td");
      raceCell.innerText = item.currentRace || "NA";

      const mtpCell = document.createElement("td");
      mtpCell.innerText = item.raceTime || "NA";
      if (Number(item?.raceTime?.replace(" MTP", "")) <= 5) {
        mtpCell.classList.add("warning-text-color");
      }
      if(arr.length === index+1){
        mtpCell.style.borderRadius = '0px 0px 4px 0px';
      }

      tableRow.append(trackCell, raceCell, mtpCell);

      raceTableBody.append(tableRow);
    });
}

function setSelectedTrack(selectedTrackName) {
  const previousTrack = selectedTrack;
  selectedTrack = tracks.find((item) => item.trackName === selectedTrackName);
  const countryImage = document.createElement("img");
  countryImage.src = `./assets/icons/flags/${countryCode[
    selectedTrack.brisCode
  ]?.toLowerCase()}.svg`;
  countryImage.className = "margin-right-8";
  document.getElementById("race-name").innerText = "";
  document
    .getElementById("race-name")
    .append(countryImage, selectedTrack.trackName);

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
  raceSelect.innerHTML = "";
  selectedTrack.raceDetails.forEach((race) => {
    const option = document.createElement("option");
    option.value = race.raceName.replace("Race ", "");
    option.innerText = race.raceName;

    if (
      selectedRace !== null &&
      previousTrack.trackName === selectedTrackName
    ) {
      selectedRace.raceNumber === option.value
        ? (option.selected = true)
        : null;
    } else if (option.value === selectedTrack.currentRace) {
      option.selected = true;
    }
    raceSelect.append(option);
  });

  fetchRaceDetails(
    selectedRace === null || previousTrack.trackName !== selectedTrackName
      ? selectedTrack.currentRace
      : selectedRace.raceNumber
  );
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
  console.log(race, selectedTrack);
  document.getElementById("race-distance").innerText = race.distance || "NA";
  document.getElementById("race-surface").innerText =
    race.surfaceConditions || "NA";
  document.getElementById("race-age").innerText = race.ageRestrictions || "NA";
  document.getElementById("race-value").innerText = race.purse || "NA";
  document.getElementById("race-class").innerText =
    race.raceDescription || "NA";
  const mtpBlock = document.getElementById("race-bar-mtp-block");
  mtpBlock.innerText =
    `${
      race.name === selectedTrack.trackName &&
      race.raceNumber === selectedTrack.currentRace &&
      (selectedTrack.raceTime === "Off" || selectedTrack.raceTime === "Official")
        ? selectedTrack.raceTime
        : race?.mtp + " MTP"
    }` || "NA";
  mtpBlock.className = "mtp-block";
  if (
    selectedTrack?.raceTime?.toLowerCase() === "off" ||
    !selectedTrack?.raceTime
  ) {
    mtpBlock.style.minWidth = "50px";
    mtpBlock.style.textAlign = "center";
  } else {
    mtpBlock.style.width = "unset";
  }
  if (
    Number(selectedRace?.mtp) <= 5 ||
    selectedTrack?.raceTime.toLowerCase() === "off"
  ) {
    mtpBlock.classList.add("mtp-block-warning");
  } else {
    mtpBlock.classList.remove("mtp-block-warning");
  }

  populatePlayersTable(race.playerInfo);
  populateResults(
    race?.result?.filter((item) => !item[0].includes("$") && item[0] !== " ")
  );
  populateExoticResults(
    race?.result?.filter((item) => item[0].includes("$") && item[0] !== " ")
  );
  populateSuggestedWagers(race.selection);
}

function populatePlayersTable(players) {
  const playersTable = document.getElementById("table-players-info");
  playersTable.innerHTML = "";

  players?.forEach((item, index, arr) => {
    const tableRow = document.createElement("tr");
    tableRow.className = "rounded-badge";
    tableRow.style.paddingLeft = "0";

    /** Number cell creation */
    const numberCell = document.createElement("td");
    if(arr.length === index+1){
      numberCell.style.borderRadius = '0px 0px 0px 4px';
    }

    const cellBlock = document.createElement("div");
    cellBlock.className = "flex-row flex-center";
    cellBlock.style.padding = "4px 0";

    const numberBlock = document.createElement("div");
    numberBlock.className = "flex-column";
    numberBlock.style.paddingRight = "12px";

    const pgmCircle = document.createElement("div");
    pgmCircle.className = "pgm-circle";

    const playerNumber = document.createElement("div");
    playerNumber.className = "player-number";
    playerNumber.style.background = item.color.background;
    if (item.color.background === "#ffffff") {
      playerNumber.style.border = "1px solid #636363";
    }
    if (item.color.font === "white" || item.programNumber === "4") {
      playerNumber.classList.add("outline-number");
    }
    playerNumber.style.color =
      item.programNumber === "4" ? "white" : item.color.font;
    playerNumber.innerText = item.programNumber;

    const numberWithCircle = document.createElement("div");
    numberWithCircle.className = "flex-row flex-center";
    numberWithCircle.append(pgmCircle, playerNumber);

    const position = document.createElement("div");
    position.innerText = item.postPosition;
    position.className = "pgm-position";
    position.style.paddingRight = "1px";

    numberBlock.append(numberWithCircle, position);
    cellBlock.append(numberBlock);
    numberCell.append(cellBlock);

    /**Horse name cell creation */
    const horseCell = document.createElement("td");
    horseCell.innerText = item.name;
    horseCell.className = "horse-table-cell";

    /**Post cell creation */
    const postCell = document.createElement("td");
    postCell.className = "position-cell";

    const postCellBlock = document.createElement("div");
    postCellBlock.className = "flex-row";
    postCellBlock.style.height = "36px";

    const horseIconBlock = document.createElement("div");
    horseIconBlock.className =
      "position-cell-horse-icon flex-column flex-jc-center";
    const horseIcon = document.createElement("img");
    horseIcon.src = "./assets/icons/horse-icon.svg";
    horseIconBlock.append(horseIcon);
    const positionBlock = document.createElement("div");
    positionBlock.innerText = item.postPosition;
    positionBlock.className = "flex-column flex-jc-center";
    postCellBlock.append(horseIconBlock, positionBlock);
    postCell.append(postCellBlock);
    // postCell.innerText = item.postPosition;

    /**Win Odds cell creation */
    const winOddsCell = document.createElement("td");
    if(arr.length === index+1){
      winOddsCell.style.borderRadius = '0px 0px 0px 4px';
    }
    winOddsCell.className = "win-odds-cell";
    const oddBlock = document.createElement("div");
    oddBlock.className = "wager";
    if (Number(item.odds) < 1) {
      oddBlock.classList.add("mtp-block-warning");
    }
    oddBlock.innerHTML = item.odds;
    winOddsCell.append(oddBlock);

    tableRow.append(numberCell, horseCell, postCell, winOddsCell);
    playersTable.append(tableRow);
  });
}

function populateResults(results) {
  const resultsContainer = document.getElementById("results-container");
  resultsContainer.innerHTML = "";
  results?.forEach((result, index) => {
    const pp = result[0];
    const pgm = result[1];
    const horseName = result[2];
    const win = result[3];
    const place = result[4];
    const show = result[5];

    const playerInfo = selectedRace.playerInfo.find(
      (player) => player.name === horseName
    );

    /**Generating header */
    const resultHeader = document.createElement("div");
    resultHeader.className = "rounded-badge flex-row margin-bottom-1";

    /**Generating number block */
    const numberBlock = document.createElement("div");
    numberBlock.className = "flex-column flex-jc-center";

    const pgmCircle = document.createElement("div");
    pgmCircle.className = "pgm-circle";
    pgmCircle.style.width = "6px";
    pgmCircle.style.height = "6px";

    const playerNumber = document.createElement("div");
    playerNumber.className = "player-number";
    playerNumber.style.background = playerInfo?.color?.background;
    if (playerInfo?.color?.background === "#ffffff") {
      playerNumber.style.border = "1px solid #636363";
    }
    if (playerInfo?.color?.font === "white") {
      playerNumber.classList.add("outline-number");
    }
    playerNumber.style.color = playerInfo?.color?.font;
    playerNumber.innerText = playerInfo?.programNumber;

    const numberWithCircle = document.createElement("div");
    numberWithCircle.className = "flex-row flex-left-center";
    numberWithCircle.append(pgmCircle, playerNumber);
    numberBlock.append(numberWithCircle);
    /**sadasdsad */

    const horseBlock = document.createElement("div");
    horseBlock.className = "flex-column margin-left-8";

    const horseText = document.createElement("div");
    horseText.innerText = "Horse";

    const horseNameText = document.createElement("div");
    horseNameText.className = "horse-name-text";
    horseNameText.innerText = horseName;

    horseBlock.append(horseText, horseNameText);

    resultHeader.append(numberBlock, horseBlock);

    /**Genearting Result Container */

    const infoBlockContainer = document.createElement("div");
    infoBlockContainer.className = "info-block-container margin-bottom-4";

    const ppInfoRow = document.createElement("div");
    ppInfoRow.className = "info-block results margin-bottom-4";

    const ppLabel = document.createElement("div");
    ppLabel.innerText = "PP";
    const ppValue = document.createElement("div");
    ppValue.innerText = pp || "NA";

    ppInfoRow.append(ppLabel, ppValue);

    const pgmInfoRow = document.createElement("div");
    pgmInfoRow.className = "info-block results margin-bottom-4";

    const pgmLabel = document.createElement("div");
    pgmLabel.innerText = "PGM";
    const pgmValue = document.createElement("div");
    pgmValue.innerText = pgm || "NA";

    pgmInfoRow.append(pgmLabel, pgmValue);

    const winInfoRow = document.createElement("div");
    winInfoRow.className = "info-block results margin-bottom-4";

    const winLabel = document.createElement("div");
    winLabel.innerText = "Win";
    const winValue = document.createElement("div");
    winValue.innerText = win || "NA";

    winInfoRow.append(winLabel, winValue);

    const placeInfoRow = document.createElement("div");
    placeInfoRow.className = "info-block results margin-bottom-4";

    const placeLabel = document.createElement("div");
    placeLabel.innerText = "Place";
    const placeValue = document.createElement("div");
    placeValue.innerText = place || "NA";

    placeInfoRow.append(placeLabel, placeValue);

    const showInfoRow = document.createElement("div");
    showInfoRow.className = "info-block results margin-bottom-4";

    const showLabel = document.createElement("div");
    showLabel.innerText = "Show";
    const showValue = document.createElement("div");
    showValue.innerText = show || "NA";

    showInfoRow.append(showLabel, showValue);

    infoBlockContainer.append(
      ppInfoRow,
      pgmInfoRow,
      winInfoRow,
      placeInfoRow,
      showInfoRow
    );
    resultsContainer.append(resultHeader, infoBlockContainer);
  });
}

function populateExoticResults(exoticResults) {
  const exoticResultsContainer = document.getElementById("exotics-container");
  exoticResultsContainer.innerHTML = "";

  exoticResults?.forEach((result) => {
    const firstCellValue = result[0];
    const secondCellValue = result[1];
    const thirdCellValue = result[2];
    const fourthCellValue = result[3];

    const exoticResultBadge = document.createElement("div");
    exoticResultBadge.className = "exotic-result-badge";

    const firstCell = document.createElement("div");
    firstCell.style.width = "fit-content";
    firstCell.innerText = firstCellValue;
    const secondCell = document.createElement("div");
    secondCell.style.width = "25%";
    secondCell.innerText = secondCellValue;
    const thirdCell = document.createElement("div");
    thirdCell.style.width = "25%";
    thirdCell.innerText = thirdCellValue;
    const fourthCell = document.createElement("div");
    fourthCell.style.width = "fit-content";
    fourthCell.innerText = fourthCellValue;

    exoticResultBadge.append(firstCell, secondCell, thirdCell, fourthCell);
    exoticResultsContainer.append(exoticResultBadge);
  });
}

function populateSuggestedWagers(selection) {
  const wageContainer = document.getElementById("suggested-wagers-container");
  wageContainer.innerHTML = "";
  selection?.forEach((item) => {
    const wagerCard = document.createElement("div");
    wagerCard.className = "suggested-wagers-card margin-bottom-1";

    const playerInfo = selectedRace.playerInfo.find(
      (player) => player.programNumber === item.programNumber
    );

    /** Generate Number Block */
    const numberBlock = document.createElement("div");
    numberBlock.className = "flex-column flex-jc-center";

    const pgmCircle = document.createElement("div");
    pgmCircle.className = "pgm-circle";
    pgmCircle.style.background = bulletColors[item.color[0]];
    pgmCircle.style.width = "6px";
    pgmCircle.style.height = "6px";

    const playerNumber = document.createElement("div");
    playerNumber.className = "player-number";
    playerNumber.style.background = playerInfo.color.background;
    if (playerInfo.color.background === "#ffffff") {
      playerNumber.style.border = "1px solid #636363";
    }
    if (playerInfo.color.font === "white") {
      playerNumber.classList.add("outline-number");
    }
    playerNumber.style.color = playerInfo.color.font;
    playerNumber.innerText = playerInfo.programNumber;

    const numberWithCircle = document.createElement("div");
    numberWithCircle.className = "flex-row flex-left-center";
    numberWithCircle.append(pgmCircle, playerNumber);
    numberBlock.append(numberWithCircle);

    /**Generate wager block */
    const wagerBlock = document.createElement("div");
    wagerBlock.className = "wager";
    wagerBlock.innerText = playerInfo.odds;

    wagerCard.append(numberBlock, wagerBlock);
    wageContainer.append(wagerCard);
  });

  const sugestedWagerCard = document.createElement("div");
  sugestedWagerCard.className = "suggested-wagers-card";
}

function changeSideBarVisibility(barId) {
  const sideBar = document.getElementById(barId);
  const footer = document.getElementsByTagName("footer")[0];
  const openBar = () => {
    sideBar.classList.add("visible");
    footer.classList.add("hidden");
  };
  const closeBar = () => {
    sideBar.classList.remove("visible");
    footer.classList.remove("hidden");
  };

  sideBar.classList.contains("visible") ? closeBar() : openBar();
}

const searchBar = document.getElementById("search-bar");

searchBar.addEventListener("input", handleSearch);

function handleSearch(e) {
  const { value } = e.target;
  searchQuery = value.trim();
  populateTracksTable(tracks);
  setSelectedTrack(selectedTrack.trackName);
}
