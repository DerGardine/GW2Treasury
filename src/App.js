import "./styles.css";
import React from "react";
import GridTable from "@nadavshaar/react-grid-table";
import { func, object } from "prop-types";
import { useEffect, useState } from "react";
import styles from "./styles.css";
import { ProgressBar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import store from "store2";

let url =
  "https://api.streamersonglist.com/v1/streamers/ninya_music/songs/export";

let urlrequest =
  "https://api.streamersonglist.com/v1/streamers/ninya_music/queue";

const queue = [];
const queueNames = [];
let pageSize = 10;

function setApiKey() {
  if (store().APIkey == null) {
    var APIkey = window.prompt("API Key: ");
    store("APIkey", APIkey);
  }
  let cachedKey = store().APIkey;
  return cachedKey;
}

setApiKey();

getPlayerBank(setApiKey());

async function getPlayerBank(APIkey) {
  let inventory = 0;
  fetch(
    "https://api.guildwars2.com/v2/account/materials?access_token=" + APIkey
  )
    .then((resp) => resp.json())
    .then((answ) => {
      for (let i = 0; i < answ.length; i++) {
        store(answ[i].id, answ[i].count);
      }
    });
}

async function getTreasury() {
  if (typeof Treasury !== "undefined") {
    store.clear(Treasury);
  }
  fetch(
    "https://api.guildwars2.com/v2/guild/008B6616-2D02-ED11-8465-06D1970130F4/treasury?access_token=F18E0DEB-9C92-3E48-83AD-6883FA1356C49DDF3D41-8E16-4A31-B992-C270FC8369C8"
  )
    .then((resp) => resp.json())
    .then((resp) => {
      for (let i = 0; i < resp.length; i++) {
        let itemID = resp[i].item_id;
        fetch("https://api.guildwars2.com/v2/items/" + itemID + "?lang=de")
          .then((answ) => answ.json())
          .then((answ) => {
            resp[i]["itemName"] = answ.name;
            resp[i]["Weblink"] = answ.icon;
            resp[i]["link"] =
              "https://wiki-de.guildwars2.com/wiki/" +
              answ.name.replaceAll(" ", "_");
            let totalNeeded = 0;
            for (let j = 0; j < resp[i].needed_by.length; j++) {
              totalNeeded = totalNeeded + resp[i].needed_by[j].count;
              resp[i]["totalAmountneeded"] = totalNeeded;
              resp[i]["stillneeded"] = totalNeeded - resp[i].count;
              resp[i]["percentage"] = parseInt(
                (resp[i].count / totalNeeded) * 100
              );
              store("Treasury", resp);
            }
          });
      }
    });
}

getTreasury();

const texts = {
  search: "Suche:",
  totalRows: "Items currently needed",
  rows: "Rows:",
  selected: "Selected",
  rowsPerPage: "Items per Page:",
  page: "Page:",
  of: "of",
  prev: "Prev",
  next: "Next",
  columnVisibility: "Column visibility"
};
const showRowsInformation = false;

const icon = ({ data }) => {
  let imgurl = data.Weblink;
  let link = data.link;
  return (
    <>
      <a href={link} target="_blank" rel="noopener noreferrer">
        <img className="zoomer" alt="Qries" src={imgurl} />
      </a>
    </>
  );
};

const anzahlInBank = ({ data }) => {
  let inventory = 0;
  const divStyle = {
    color: "blue",
    fontWeight: "normal"
  };

  let amount = store(data.item_id);
  if (amount == null) {
    inventory = 0;
    divStyle.color = "Red";
  } else if (amount == 0) {
    divStyle.color = "Red";
  } else {
    inventory = store(data.item_id);
    divStyle.color = "Green";
    divStyle.fontWeight = "bold";
  }

  return (
    <>
      {}
      <div
        className="rgt-cell-inner rgt-text-truncate"
        style={divStyle}
        title="{inventory}"
      >
        {inventory}
      </div>
    </>
  );
};

let rowID = 1;
const progressBar = ({ data }) => {
  let min = data.count;
  let needed = data.totalAmountneeded;
  let percentage = data.percentage;
  let style = {
    color: "blue",
    height: "25px",
    width: percentage
  };
  return (
    <div className="progressBar">
      <ProgressBar now={percentage} label={`${percentage}%`} />
    </div>
  );
};

const columns = [
  {
    id: 1,
    label: "",
    field: "count",
    cellRenderer: icon,
    width: "3%",
    className: "rgt-override"
  },
  {
    id: 2,
    field: "itemName",
    label: "Item",
    width: "20%",
    className: "rgt-override"
  },
  {
    id: 3,
    field: "count",
    label: "Aktuell",
    width: "5%",
    className: "rgt-override"
  },
  {
    id: 4,
    label: "Benötigt",
    field: "stillneeded",
    width: "10%",
    minResizeWidth: "100",
    className: "rgt-override"
  },
  {
    id: 5,
    label: "Materiallager",
    field: "totalAmountneeded",
    cellRenderer: anzahlInBank,
    width: "10%",
    sortable: false,
    className: "rgt-override"
  },
  {
    id: 6,
    label: "Fortschritt",
    field: "percentage",
    cellRenderer: progressBar,
    width: "40%",
    className: "rgt-override"
  },

  {
    id: 7,
    label: "Item ID",
    field: "item_id",
    width: "10%",
    sortable: false,
    visible: false,
    className: "rgt-override"
  }
];

const App = () => {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  useEffect(() => {
    fetch(
      "https://api.guildwars2.com/v2/guild/008B6616-2D02-ED11-8465-06D1970130F4/treasury?access_token=F18E0DEB-9C92-3E48-83AD-6883FA1356C49DDF3D41-8E16-4A31-B992-C270FC8369C8"
    )
      .then((resp) => resp.json())
      .then((resp) => {
        for (let i = 0; i < resp.length; i++) {
          let itemID = resp[i].item_id;
          fetch("https://api.guildwars2.com/v2/items/" + itemID + "?lang=de")
            .then((answ) => answ.json())
            .then((answ) => {
              resp[i]["itemName"] = answ.name;
              resp[i]["Weblink"] = answ.icon;
              resp[i]["link"] =
                "https://wiki-de.guildwars2.com/wiki/" +
                answ.name.replaceAll(" ", "_");
              let totalNeeded = 0;
              for (let j = 0; j < resp[i].needed_by.length; j++) {
                totalNeeded = totalNeeded + resp[i].needed_by[j].count;
                resp[i]["totalAmountneeded"] = totalNeeded;
              }
            });
        }

        setRows(store().Treasury.filter((stuff) => stuff.percentage < 101));
      });
  }, [query]);

  return (
    <>
      <GridTable
        columns={columns}
        rows={rows}
        isPaginated={false}
        pageSize={pageSize}
        texts={texts}
      />
    </>
  );
};

export default App;
