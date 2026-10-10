/**
 * Controle de Entrega NF-e — backend Google Sheets
 *
 * COMO USAR (5 min):
 * 1. Crie/abra a planilha (ex.: "Entrega NFe").
 * 2. Extensões > Apps Script > apague tudo e cole este arquivo.
 * 3. Implantar > Nova implantação > "Aplicativo da Web":
 *    - Executar como: Eu
 *    - Acesso: Qualquer pessoa  (obrigatório p/ o app chamar sem login)
 *    - Copie a URL .../exec
 * 4. No app: "Configurar planilha" > cole a URL.
 *    Ou defina VITE_GOOGLE_SCRIPT_URL na Vercel.
 *
 * Colunas: Data/Hora | Numero NFe | Chave Completa | Entregador
 * - Ignora numero vazio e evita duplicar a mesma chave em < 60s (bip duplo).
 */

const SHEET_NAME = ''; // vazio = usa a primeira aba (recomendado). Ou fixe ex.: 'Planilha1'

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = (SHEET_NAME && ss.getSheetByName(SHEET_NAME)) || ss.getSheets()[0] || ss.getActiveSheet();

    const data = JSON.parse(e.postData.contents || '{}');
    const numeroNfe = String(data.numeroNfe || '').trim();
    const chave = String(data.chave || '').trim();
    const entregador = String(data.entregador || '').trim();

    if (!numeroNfe) return resposta({ ok: false, error: 'numeroNfe vazio' });

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Data/Hora', 'Numero NFe', 'Chave Completa', 'Entregador']);
    }

    // Anti-duplicada: mesma chave nos últimos registros (protege bip duplo)
    const lastRows = sheet.getRange(Math.max(1, sheet.getLastRow() - 20), 1, Math.min(20, sheet.getLastRow()), 4).getValues();
    const agora = new Date().getTime();
    for (const r of lastRows) {
      const dataLinha = r[0] instanceof Date ? r[0].getTime() : 0;
      if (String(r[2] || '') === chave && chave !== '' && agora - dataLinha < 60000) {
        return resposta({ ok: true, duplicada: true, numeroNfe });
      }
    }

    sheet.appendRow([new Date(), numeroNfe, chave, entregador]);
    return resposta({ ok: true, numeroNfe });
  } catch (err) {
    return resposta({ ok: false, error: String(err) });
  }
}

function doGet() {
  return resposta({ online: true });
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
