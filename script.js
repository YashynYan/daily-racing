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
  const currentDateRaceBarMobile = document.getElementById(
    "current-date-race-bar-mobile"
  );
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
  currentDateRaceBarMobile.innerText = currentDateRaceBar.innerText;
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
      tableRow.addEventListener("click", (e) => {
        setSelectedTrack(item.trackName);
      });

      const trackCell = document.createElement("td");
      if (arr.length === index + 1) {
        trackCell.style.borderRadius = "0px 0px 0px 4px";
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
      if (arr.length === index + 1) {
        mtpCell.style.borderRadius = "0px 0px 4px 0px";
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
  const raceNameBlock = document.getElementById("race-name");
  const raceNameBlockMobile = document.getElementById("race-name-mobile");
  const wagerResultsTrackInfoBlock = document.getElementById(
    "wager-results-track-name"
  );
  raceNameBlock.innerHTML = "";
  raceNameBlockMobile.innerHTML = "";
  wagerResultsTrackInfoBlock.innerHTML = "";

  wagerResultsTrackInfoBlock.append(countryImage, selectedTrack.trackName);
  raceNameBlock.innerHTML = wagerResultsTrackInfoBlock.innerHTML;
  raceNameBlockMobile.innerHTML = wagerResultsTrackInfoBlock.innerHTML;

  document.getElementById("races-table-body").childNodes.forEach((child) => {
    if (
      child.firstChild.innerText.toString() == selectedTrack.trackName &&
      !child.classList.contains("selected-row")
    ) {
      child.classList.toggle("selected-row");
    } else if (
      child.firstChild?.innerText !== selectedTrack.trackName &&
      child.classList?.contains("selected-row")
    ) {
      child.classList.toggle("selected-row");
    }
  });

  if (
    previousTrack?.trackName !== selectedTrack?.trackName &&
    selectedRace?.name !== selectedTrack?.trackName
  ) {
    const raceSelect = document.getElementById("race-select");
    const raceSelectMobile = document.getElementById("race-select-mobile");
    raceSelect.innerHTML = "";
    raceSelectMobile.innerHTML = "";
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
      raceSelectMobile.innerHTML = raceSelect.innerHTML;
    });
  }

  selectedRace === null || previousTrack.trackName !== selectedTrackName
    ? styleDropdowns()
    : null;

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
    .then(async (data) => {
      console.log(data);
      await setSelectedRace(data);
    })
    .catch((error) => {
      populateExoticResults([]);
      populatePlayersTable([]);
      populateResults([]);
      populateSuggestedWagers([]);
      setSelectedRace({});
    });
}

async function setSelectedRace(race) {
  selectedRace = race;
  document.getElementById("race-distance").innerText = race.distance || "NA";
  document.getElementById("race-surface").innerText =
    race.surfaceConditions || "NA";
  document.getElementById("race-age").innerText = race.ageRestrictions || "NA";
  document.getElementById("race-value").innerText = race.purse || "NA";
  document.getElementById("race-class").innerText =
    race.raceDescription || "NA";
  document.getElementById(
    "wager-results-race-name"
  ).innerText = `Race ${race.raceNumber}`;
  const mtpBlock = document.getElementById("race-bar-mtp-block");
  const mtpBlockMobile = document.getElementById("race-bar-mtp-block-mobile");
  const wagerMtpBlock = document.getElementById("wager-results-race-mtp");
  mtpBlock.innerText = `${
    race.status === "Open"
      ? race.mtp + " MTP"
      : race.status === "Closed"
      ? "Official"
      : race?.status || "NA"
  }`;
  wagerMtpBlock.innerText = mtpBlock.innerText;
  mtpBlockMobile.innerText = mtpBlock.innerText;

  mtpBlock.className = "mtp-block";
  mtpBlockMobile.className = "mtp-block";
  wagerMtpBlock.className = "mtp-block";
  if (
    selectedTrack?.raceTime?.toLowerCase() === "off" ||
    !selectedTrack?.raceTime
  ) {
    mtpBlock.style.textAlign = "center";
    mtpBlockMobile.style.textAlign = "center";
    wagerMtpBlock.style.textAlign = "center";
  } else {
    mtpBlock.style.width = "unset";
    mtpBlockMobile.style.width = "unset";
    wagerMtpBlock.style.width = "unset";
  }

  if (
    (Number(selectedRace?.mtp) <= 5 || race.status === "Off") &&
    race.status !== "Closed"
  ) {
    mtpBlock.classList.add("mtp-block-warning");
    mtpBlockMobile.classList.add("mtp-block-warning");
    wagerMtpBlock.classList.add("mtp-block-warning");
  } else {
    mtpBlock.classList.remove("mtp-block-warning");
    mtpBlockMobile.classList.remove("mtp-block-warning");
    wagerMtpBlock.classList.remove("mtp-block-warning");
  }

  populatePlayersTable(race.playerInfo);
  populateResults(
    race?.result?.filter((item) => !item[0].includes("$") && item[0] !== " ")
  );
  populateExoticResults(
    race?.result?.filter((item) => item[0].includes("$") && item[0] !== " ")
  );
  populateSuggestedWagers(race.selection);
  await calculateYields();
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
    if (arr.length === index + 1) {
      numberCell.style.borderRadius = "0px 0px 0px 4px";
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

    /**Empty cell */
    const emptyCell = document.createElement("td");

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
    if (arr.length === index + 1) {
      winOddsCell.style.borderRadius = "0px 0px 0px 4px";
    }
    winOddsCell.className = "win-odds-cell";
    const oddBlock = document.createElement("div");
    oddBlock.className = "wager";
    if (Number(item.odds) < 1) {
      oddBlock.classList.add("mtp-block-warning");
    }
    oddBlock.innerHTML = checkWinOdd(item.odds);
    winOddsCell.append(oddBlock);

    tableRow.append(numberCell, horseCell, emptyCell, postCell, winOddsCell);
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
    if (playerInfo.color.font === "white" || playerInfo.programNumber === "4") {
      playerNumber.classList.add("outline-number");
    }
    playerNumber.style.color =
      playerInfo.programNumber === "4" ? "white" : playerInfo.color.font;
    playerNumber.innerText = playerInfo.programNumber;
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
    if (playerInfo.color.font === "white" || playerInfo.programNumber === "4") {
      playerNumber.classList.add("outline-number");
    }
    playerNumber.style.color =
      playerInfo.programNumber === "4" ? "white" : playerInfo.color.font;
    playerNumber.innerText = playerInfo.programNumber;

    const numberWithCircle = document.createElement("div");
    numberWithCircle.className = "flex-row flex-left-center";
    numberWithCircle.append(pgmCircle, playerNumber);
    numberBlock.append(numberWithCircle);

    /**Generate wager block */
    const wagerBlock = document.createElement("div");
    wagerBlock.className = "wager";
    wagerBlock.innerText = checkWinOdd(playerInfo.odds);

    wagerCard.append(numberBlock, wagerBlock);
    wageContainer.append(wagerCard);
  });

  const sugestedWagerCard = document.createElement("div");
  sugestedWagerCard.className = "suggested-wagers-card";
}

async function calculateYields() {
  let redYield = -2;
  let yellowYield = -2;
  let greenYield = -2;
  let progressiveRedYield = 0;
  let progressiveTotalYield = -2 * selectedRace.selection.length;
  const redYieldContainer = document.getElementById("red-yield-value");
  const yellowYieldContainer = document.getElementById("yellow-yield-value");
  const greenYieldContainer = document.getElementById("green-yield-value");
  const progressiveRedYieldContainer = document.getElementById(
    "progressive-red-yield-value"
  );
  const progressiveTotalYieldContainer = document.getElementById(
    "progressive-total-yield-value"
  );

  if (selectedRace.status === "Official") {
    const resultWithWinValue = selectedRace?.result?.filter(
      (item) => !item[0].includes("$") && item[0] !== " " && item[3] !== " "
    );

    resultWithWinValue.forEach((item) => {
      const horseName = item[2];

      const horseNumber = selectedRace.find(
        (race) => race.name === horseName
      ).programNumber;

      selectedRace.selection.forEach((selection) => {
        if (selection.programNumber === horseNumber) {
          switch (selection.color[0]) {
            case "red":
              redYield = redYield + item[3];
              break;
            case "yellow":
              yellowYield = redYield + item[3];
              break;
            case "green":
              greenYield = redYield + item[3];
              break;
          }
        }
      });

      if (redYield !== -2) {
        progressiveTotalYield = progressiveTotalYield + redYield;
      }
      if (yellowYield !== -2) {
        progressiveTotalYield = progressiveTotalYield + yellowYield;
      }
      if (greenYield !== -2) {
        progressiveTotalYield = progressiveTotalYield + greenYield;
      }
    });

    for (i = 1; i < Number(selectedRace.raceNumber); i++) {
      await fetch(
        `${API_ADDRESS}race-detail/?bris_code=${selectedTrack.brisCode}&race_number=${i}`,
        { keepalive: true, headers: { "Content-Type": "application/json" } }
      )
        .then((response) => response.json())
        .then((data) => {
          let previousRedYield = -2;
          let previousYellowYield = -2;
          let previousGreenYield = -2;
          let previousTotalYield = -2 * data.selection.length;

          const previousResultWithWinValue = data?.result?.filter(
            (item) =>
              !item[0].includes("$") && item[0] !== " " && item[3] !== " "
          );

          previousResultWithWinValue.forEach((item) => {
            const horseName = item[2];

            const previousHorseNumber = data.find(
              (race) => race.name === horseName
            ).programNumber;

            data.selection.forEach((selection) => {
              if (selection.programNumber === previousHorseNumber) {
                switch (selection.color[0]) {
                  case "red":
                    previousRedYield = previousRedYield + item[3];
                    break;
                  case "yellow":
                    previousYellowYield = redYield + item[3];
                    break;
                  case "green":
                    previousGreenYield = redYield + item[3];
                    break;
                }
              }
            });

            if (previousRedYield !== -2) {
              previousTotalYield = previousTotalYield + previousRedYield;
            }
            if (previousYellowYield !== -2) {
              previousTotalYield = previousTotalYield + previousYellowYield;
            }
            if (previousGreenYield !== -2) {
              previousTotalYield = previousTotalYield + previousGreenYield;
            }
          });

          progressiveRedYield = progressiveRedYield + previousRedYield;
          progressiveTotalYield = progressiveTotalYield + previousTotalYield;
        });
    }
  }

  redYieldContainer.innerText = redYield > 0 ? `+${redYield}` : redYield;
  yellowYieldContainer.innerText =
    yellowYield > 0 ? `+${yellowYield}` : yellowYield;
  greenYieldContainer.innerText =
    greenYield > 0 ? `+${greenYield}` : greenYield;
  progressiveRedYieldContainer.innerText =
    progressiveRedYield > 0 ? `+${progressiveRedYield}` : progressiveRedYield;
  progressiveTotalYieldContainer.innerText =
    progressiveTotalYield > 0
      ? `+${progressiveTotalYield}`
      : progressiveTotalYield;
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

function styleDropdowns() {
  var x, i, j, l, ll, selElmnt, a, b, c;
  /*look for any elements with the class "custom-select":*/
  x = document.getElementsByClassName("custom-select");
  Array.from(x).forEach((item) => {
    const select = item.getElementsByTagName("select")[0];
    item.innerHTML = "";
    item.append(select);
  });
  l = x.length;
  for (i = 0; i < l; i++) {
    selElmnt = x[i].getElementsByTagName("select")[0];
    ll = selElmnt.length;
    /*for each element, create a new DIV that will act as the selected item:*/
    a = document.createElement("DIV");
    a.setAttribute("class", "select-selected");
    a.innerHTML = selElmnt?.options[selElmnt?.selectedIndex]?.innerHTML || "NA";
    if (a.innerHTML === "NA") {
      a.style.width = "unset";
    } else {
      a.removeAttribute("style");
    }
    x[i].appendChild(a);
    /*for each element, create a new DIV that will contain the option list:*/
    b = document.createElement("DIV");
    b.setAttribute("class", "select-items select-hide");
    for (j = 0; j < ll; j++) {
      /*for each option in the original select element,
    create a new DIV that will act as an option item:*/
      c = document.createElement("DIV");
      let option = selElmnt.options[j];
      c.innerHTML = option.innerHTML;

      c.addEventListener("click", function (e) {
        /*when an item is clicked, update the original select box,
        and the selected item:*/
        fetchRaceDetails(option.value);
        var y, i, k, s, h, sl, yl;
        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        sl = s.length;
        h = this.parentNode.previousSibling;
        for (i = 0; i < sl; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = this.innerHTML;
            y = this.parentNode.getElementsByClassName("same-as-selected");
            yl = y.length;
            for (k = 0; k < yl; k++) {
              y[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }
        h.click();
      });
      b.appendChild(c);
    }
    x[i].appendChild(b);
    a.addEventListener("click", function (e) {
      /*when the select box is clicked, close any other select boxes,
      and open/close the current select box:*/
      e.stopPropagation();
      closeAllSelect(this);
      this.nextSibling.classList.toggle("select-hide");
      this.classList.toggle("select-arrow-active");
    });
  }
  function closeAllSelect(elmnt) {
    /*a function that will close all select boxes in the document,
  except the current select box:*/
    var x,
      y,
      i,
      xl,
      yl,
      arrNo = [];
    x = document.getElementsByClassName("select-items");
    y = document.getElementsByClassName("select-selected");
    xl = x.length;
    yl = y.length;
    for (i = 0; i < yl; i++) {
      if (elmnt == y[i]) {
        arrNo.push(i);
      } else {
        y[i].classList.remove("select-arrow-active");
      }
    }
    for (i = 0; i < xl; i++) {
      if (arrNo.indexOf(i)) {
        x[i].classList.add("select-hide");
      }
    }
  }
  /*if the user clicks anywhere outside the select box,
then close all select boxes:*/
  document.addEventListener("click", closeAllSelect);
}

function checkWinOdd(odd) {
  if (isNaN(odd)) {
    return odd;
  } else {
    return Number(Number(odd).toFixed(2));
  }
}
