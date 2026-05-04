const supabaseUrl = "https://kzxokzkiengxzazckrgb.supabase.co";
const supabaseKey = "sb_publishable_1e1v247yJhKoc4gqqI4U9A_r2_l3ht_";

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("guestForm");
const input = document.getElementById("guestName");
const result = document.getElementById("result");

function normalizeText(text) {
  const polishMap = {
    "ą": "a", "ć": "c", "ę": "e", "ł": "l", "ń": "n",
    "ó": "o", "ś": "s", "ź": "z", "ż": "z",
    "Ą": "A", "Ć": "C", "Ę": "E", "Ł": "L", "Ń": "N",
    "Ó": "O", "Ś": "S", "Ź": "Z", "Ż": "Z"
  };

  return String(text)
    .trim()
    .toLowerCase()
    .replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, char => polishMap[char] || char)
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function displayTableName(table) {
  if (String(table).toLowerCase() === "main") {
    return "Główny";
  }

  return table;
}

function clearActiveTable() {
  document.querySelectorAll(".table").forEach(table => {
    table.classList.remove("active");
  });
}

function highlightTable(tableNumber) {
  clearActiveTable();

  const tableElement = document.getElementById(`table-${tableNumber}`);

  if (tableElement) {
    tableElement.classList.add("active");
  } else {
    console.warn("Nie znaleziono elementu mapki dla stolika:", `table-${tableNumber}`);
  }
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const rawName = input.value;
  const typedName = normalizeText(rawName);

  result.classList.remove("hidden", "error");
  result.innerHTML = "Szukamy Twojego stolika...";

  const { data, error } = await supabaseClient
    .from("guests")
    .select("name, table_id, normalized_name")
    .eq("normalized_name", typedName)
    .maybeSingle();

  if (error) {
    result.classList.add("error");
    result.innerHTML = `
      Wystąpił problem z wyszukiwaniem.<br>
      Poproś obsługę o pomoc.
    `;

    clearActiveTable();
    return;
  }

  if (data) {
    const tableName = displayTableName(data.table_id);

    result.innerHTML = `
      Cześć, ${data.name}!<br>
      Twój stolik to:<br>
      <strong>${tableName}</strong>
    `;

    highlightTable(data.table_id);
  } else {
    result.classList.add("error");
    result.innerHTML = `
      Nie znaleźliśmy tego nazwiska.<br>
      Sprawdź pisownię albo podejdź do obsługi.
    `;

    clearActiveTable();
  }
});
