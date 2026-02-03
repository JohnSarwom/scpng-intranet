/**
 * Robust PNGX scraper for Google Sheets - Synced to SharePoint List Structure
 *
 * Requirements:
 * - Writes data to sheet named "PNGX"
 * - Appends a run log to sheet named "PNGX_Log"
 * - Matches SharePoint "Market_Companies" list columns EXACTLY.
 *
 * SharePoint List Columns:
 * Title, CompanyName, Sector, LastPrice, PreviousClose, ChangePercent, Volume,
 * MarketCap, PrimaryColor, SecondaryColor, IsActive, DisplayOrder, CompanyLogo,
 * Website, Description
 */

function scrapePNGX() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheetName = "PNGX";
  const logSheetName = "PNGX_Log";

  // SharePoint Column Structure (Order matters for proper syncing if positional,
  // but usually Header names are key. We will enforce this Header row).
  const expectedHeaders = [
    "Title",           // Mapped from API 'code'
    "CompanyName",     // Mapped from API 'short_name' or 'code' (API lacks full name)
    "Sector",          // Empty (API missing data)
    "LastPrice",       // Mapped from API 'last'
    "PreviousClose",   // Calculated: last - chg_today
    "ChangePercent",   // Calculated: chg_today / PreviousClose
    "Volume",          // Mapped from API 'vol_today'
    "MarketCap",       // Empty
    "PrimaryColor",    // Empty
    "SecondaryColor",  // Empty
    "IsActive",        // Default to TRUE
    "DisplayOrder",    // Row Index
    "CompanyLogo",     // Empty
    "Website",         // Empty
    "Description"      // Empty
  ];

  // Candidate API endpoints
  const candidateApis = [
    "https://api.nuku-api.com.pg/api/v2/stocks",
    "https://nuku.zeabur.app/api/v2/stocks"
  ];

  // 1. Setup Logging
  const logSheet = ss.getSheetByName(logSheetName) || ss.insertSheet(logSheetName);
  ensureLogHeader(logSheet);

  // 2. Try APIs
  for (let i = 0; i < candidateApis.length; i++) {
    const url = candidateApis[i];
    const apiResp = tryFetch(url);

    if (apiResp.ok) {
      try {
        const payload = JSON.parse(apiResp.text);
        // data usually in payload.data (array)
        const stocks = payload.data || payload.stocks || payload;

        if (Array.isArray(stocks) && stocks.length > 0) {
          appendRunLog(logSheet, "API", url, "success", `Parsed ${stocks.length} items`, "");
          
          // MAP Data to SharePoint Structure
          const tableData = mapStocksToSharePointSchema(stocks, expectedHeaders);
          
          writeDataToSheet(ss, dataSheetName, expectedHeaders, tableData);
          Logger.log(`Success: Wrote ${tableData.length} rows to ${dataSheetName} using API.`);
          return;
        } else {
          appendRunLog(logSheet, "API", url, "empty-data", "JSON parsed but no array found", apiResp.text.slice(0, 200));
        }
      } catch (e) {
        appendRunLog(logSheet, "API", url, "json-error", e.toString(), apiResp.text.slice(0, 200));
      }
    } else {
      appendRunLog(logSheet, "API", url, "fetch-error", apiResp.statusText, "");
    }
  }

  // 3. Fallback: HTML Scrape (Note: This might be unreliable if client-side rendered)
  const pageUrl = "https://www.pngx.com.pg/companies/market-statistics/";
  Logger.log("API failed, attempting HTML fallback...");
  // Implement HTML fallback only if strictly necessary and API fails reliably.
  // For now, if API fails, we log it. The API seemed to work in testing.
  appendRunLog(logSheet, "HTML", pageUrl, "skipped", "API fallback path not fully implemented for new schema. Relying on API.", "");
}

/**
 * Maps the raw API stock objects to the specific 2D array needed for SharePoint.
 */
function mapStocksToSharePointSchema(stocks, headers) {
  return stocks.map((stock, index) => {
    // Extract raw values
    const code = String(stock.code || "");
    const last = parseFloat(stock.last || 0);
    const chg = parseFloat(stock.chg_today || 0);
    const vol = parseFloat(stock.vol_today || 0);
    // stock.close might be available, but let's calculate prevClose reliability
    // If chg is change from yesterday close, then PrevClose = Last - Change.
    // Example: Last=3.81, Chg=-0.04. Prev = 3.85. 3.81 - (-0.04) = 3.85. Correct.
    const prevClose = last - chg; 
    
    // Percent Change
    let pctChg = 0;
    if (prevClose !== 0) {
      pctChg = chg / prevClose; // decimal, e.g. -0.01
    }

    // Map to columns by index of expectedHeaders
    // 0: Title (Ticker)
    // 1: CompanyName
    // 2: Sector
    // 3: LastPrice
    // 4: PreviousClose
    // 5: ChangePercent
    // 6: Volume
    // 7: MarketCap
    // 8: PrimaryColor
    // 9: SecondaryColor
    // 10: IsActive
    // 11: DisplayOrder
    // 12: CompanyLogo
    // 13: Website
    // 14: Description

    return [
      code,                     // Title
      stock.short_name || code, // CompanyName (Use short_name if avail)
      "",                       // Sector (Missing)
      last,                     // LastPrice
      prevClose,                // PreviousClose
      pctChg,                   // ChangePercent
      vol,                      // Volume
      "",                       // MarketCap
      "",                       // PrimaryColor
      "",                       // SecondaryColor
      true,                     // IsActive (Boolean yes/no)
      index + 1,                // DisplayOrder
      "",                       // CompanyLogo
      "",                       // Website
      ""                        // Description
    ];
  });
}

function writeDataToSheet(ss, sheetName, headers, requestData) {
  const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  sheet.clear(); // Clear all old data
  
  // Write Headers
  if (headers && headers.length) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }

  // Write Data
  if (requestData && requestData.length) {
    const rows = requestData.length;
    const cols = requestData[0].length;
    sheet.getRange(2, 1, rows, cols).setValues(requestData);
  }
}

/* ----------------------- Helpers ----------------------- */

function tryFetch(url) {
  try {
    const resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    return { 
      ok: resp.getResponseCode() === 200, 
      text: resp.getContentText(), 
      statusText: resp.getResponseCode().toString() 
    };
  } catch (e) {
    return { ok: false, text: "", statusText: e.toString() };
  }
}

function ensureLogHeader(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Method", "Source", "Status", "Message", "Sample"]);
  }
}

function appendRunLog(sheet, method, source, status, message, sample) {
  sheet.appendRow([
    new Date(), 
    method, 
    source, 
    status, 
    message, 
    sample
  ]);
}
