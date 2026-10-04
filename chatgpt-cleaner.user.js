// ==UserScript==
// @name         ChatGPT Cleaner
// @namespace    https://github.com/dotKz/chatgpt-cleaner
// @version      1.0.0
// @description  Manage, filter, archive, restore and bulk-delete ChatGPT conversations from a native-style panel.
// @author       dotKz
// @license      MIT
// @homepageURL  https://github.com/dotKz/chatgpt-cleaner
// @supportURL   https://github.com/dotKz/chatgpt-cleaner/issues
// @updateURL    https://raw.githubusercontent.com/dotKz/chatgpt-cleaner/main/chatgpt-cleaner.user.js
// @downloadURL  https://raw.githubusercontent.com/dotKz/chatgpt-cleaner/main/chatgpt-cleaner.user.js
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

// Author: dotKz
// Discord: kz.kz

(function () {
  'use strict';

  const CONFIG = {
    PAGE_SIZE: 100,
    RENDER_LIMIT: 150,
    RENDER_STEP: 150,
    SEARCH_DELAY: 110,
    MUTATION_DELAY: 120,
    RETRIES: 3,
    PROJECT_CONCURRENCY: 3,
  };

  let accessToken = null;
  let conversations = [];
  let projects = [];
  let renderLimit = CONFIG.RENDER_LIMIT;
  let loading = false;
  let mutating = false;
  let searchTimer = null;
  let loadGeneration = 0;
  let openMenuType = null;

  const selectedIds = new Set();
  const ui = {};


  // ============================================================
  // I18N — follows ChatGPT/browser language automatically
  // ============================================================

  const I18N = {
    en: {
      launcherChats:'Chats', manageChats:'Manage chats', conversations:'conversations', projects:'projects', refresh:'Refresh', close:'Close',
      searchChats:'Search conversations…', active:'Active', archives:'Archives', selection:'Selected',
      scopeAll:'All chats', scopeProjects:'In projects', scopeOutside:'Outside projects', projectAll:'All projects',
      sortRecent:'Recent', sortOld:'Oldest', sortAZ:'A → Z', sortProject:'By project', show:'Show', sortBy:'Sort by',
      resultsOne:'{count} result', resultsOther:'{count} results', selectAll:'Select all', deselectAll:'Deselect all',
      clearSelection:'Clear selection', selectedOne:'{count} selected', selectedOther:'{count} selected', noPending:'No pending action',
      archive:'Archive', restore:'Restore', delete:'Delete', cancel:'Cancel', deleteTitle:'Delete conversations?',
      searchProject:'Search projects…', noProjectFound:'No project found', noSelected:'No conversation selected', noConversation:'No conversation',
      trySearch:'Try another search.', adjustFilters:'Change the filters to show more chats.', archived:'Archived', untitled:'Untitled',
      outsideProject:'Outside project', open:'Open', openConversation:'Open conversation', showMore:'Show {count} more',
      selectedMixed:'{active} active · {archived} archived', selectedActive:'{count} active', selectedArchived:'{count} archived',
      deleteConfirmOne:'{count} conversation will be removed from your ChatGPT history. This cannot be undone from this tool.',
      deleteConfirmOther:'{count} conversations will be removed from your ChatGPT history. This cannot be undone from this tool.',
      archiving:'Archiving', restoring:'Restoring', deleting:'Deleting', doneArchived:'archived', doneRestored:'restored', doneDeleted:'deleted',
      failureOne:'{count} failure', failureOther:'{count} failures', loadingConversations:'Loading conversations…', upToDate:'Up to date', error:'Error',
      today:'Today', yesterday:'Yesterday', project:'Project', unnamedProject:'Unnamed project', manageConversations:'ChatGPT conversation manager'
    },
    fr: {
      launcherChats:'Chats', manageChats:'Gérer les chats', conversations:'conversations', projects:'projets', refresh:'Actualiser', close:'Fermer',
      searchChats:'Rechercher dans les conversations…', active:'Actifs', archives:'Archives', selection:'Sélection',
      scopeAll:'Tous les chats', scopeProjects:'Dans les projets', scopeOutside:'Hors projets', projectAll:'Tous les projets',
      sortRecent:'Récents', sortOld:'Anciens', sortAZ:'A → Z', sortProject:'Par projet', show:'Afficher', sortBy:'Trier par',
      resultsOne:'{count} résultat', resultsOther:'{count} résultats', selectAll:'Tout sélectionner', deselectAll:'Tout désélectionner',
      clearSelection:'Effacer la sélection', selectedOne:'{count} sélectionné', selectedOther:'{count} sélectionnés', noPending:'Aucune action en attente',
      archive:'Archiver', restore:'Restaurer', delete:'Supprimer', cancel:'Annuler', deleteTitle:'Supprimer les conversations ?',
      searchProject:'Rechercher un projet…', noProjectFound:'Aucun projet trouvé', noSelected:'Aucune conversation sélectionnée', noConversation:'Aucune conversation',
      trySearch:'Essaie une autre recherche.', adjustFilters:'Modifie les filtres pour afficher davantage de chats.', archived:'Archivé', untitled:'Sans titre',
      outsideProject:'Hors projet', open:'Ouvrir', openConversation:'Ouvrir la conversation', showMore:'Afficher {count} de plus',
      selectedMixed:'{active} actif · {archived} archivé', selectedActive:'{count} actif', selectedArchived:'{count} archivé',
      deleteConfirmOne:'{count} conversation sera supprimée de ton historique ChatGPT. Cette action n’est pas annulable depuis cet outil.',
      deleteConfirmOther:'{count} conversations seront supprimées de ton historique ChatGPT. Cette action n’est pas annulable depuis cet outil.',
      archiving:'Archivage', restoring:'Restauration', deleting:'Suppression', doneArchived:'archivé', doneRestored:'restauré', doneDeleted:'supprimé',
      failureOne:'{count} échec', failureOther:'{count} échecs', loadingConversations:'Chargement des conversations…', upToDate:'À jour', error:'Erreur',
      today:'Aujourd’hui', yesterday:'Hier', project:'Projet', unnamedProject:'Projet sans nom', manageConversations:'Gestionnaire de conversations ChatGPT'
    },
    es: {
      launcherChats:'Chats', manageChats:'Gestionar chats', conversations:'conversaciones', projects:'proyectos', refresh:'Actualizar', close:'Cerrar',
      searchChats:'Buscar conversaciones…', active:'Activos', archives:'Archivados', selection:'Selección',
      scopeAll:'Todos los chats', scopeProjects:'En proyectos', scopeOutside:'Fuera de proyectos', projectAll:'Todos los proyectos',
      sortRecent:'Recientes', sortOld:'Antiguos', sortAZ:'A → Z', sortProject:'Por proyecto', show:'Mostrar', sortBy:'Ordenar por',
      resultsOne:'{count} resultado', resultsOther:'{count} resultados', selectAll:'Seleccionar todo', deselectAll:'Deseleccionar todo',
      clearSelection:'Borrar selección', selectedOne:'{count} seleccionado', selectedOther:'{count} seleccionados', noPending:'Ninguna acción pendiente',
      archive:'Archivar', restore:'Restaurar', delete:'Eliminar', cancel:'Cancelar', deleteTitle:'¿Eliminar conversaciones?',
      searchProject:'Buscar un proyecto…', noProjectFound:'No se encontró ningún proyecto', noSelected:'Ninguna conversación seleccionada', noConversation:'Ninguna conversación',
      trySearch:'Prueba otra búsqueda.', adjustFilters:'Cambia los filtros para mostrar más chats.', archived:'Archivado', untitled:'Sin título',
      outsideProject:'Fuera de proyecto', open:'Abrir', openConversation:'Abrir conversación', showMore:'Mostrar {count} más',
      selectedMixed:'{active} activos · {archived} archivados', selectedActive:'{count} activos', selectedArchived:'{count} archivados',
      deleteConfirmOne:'Se eliminará {count} conversación de tu historial de ChatGPT. No se puede deshacer desde esta herramienta.',
      deleteConfirmOther:'Se eliminarán {count} conversaciones de tu historial de ChatGPT. No se puede deshacer desde esta herramienta.',
      archiving:'Archivando', restoring:'Restaurando', deleting:'Eliminando', doneArchived:'archivados', doneRestored:'restaurados', doneDeleted:'eliminados',
      failureOne:'{count} error', failureOther:'{count} errores', loadingConversations:'Cargando conversaciones…', upToDate:'Actualizado', error:'Error',
      today:'Hoy', yesterday:'Ayer', project:'Proyecto', unnamedProject:'Proyecto sin nombre', manageConversations:'Gestor de conversaciones de ChatGPT'
    },
    de: {
      launcherChats:'Chats', manageChats:'Chats verwalten', conversations:'Unterhaltungen', projects:'Projekte', refresh:'Aktualisieren', close:'Schließen',
      searchChats:'Unterhaltungen durchsuchen…', active:'Aktiv', archives:'Archiv', selection:'Auswahl',
      scopeAll:'Alle Chats', scopeProjects:'In Projekten', scopeOutside:'Außerhalb von Projekten', projectAll:'Alle Projekte',
      sortRecent:'Neueste', sortOld:'Älteste', sortAZ:'A → Z', sortProject:'Nach Projekt', show:'Anzeigen', sortBy:'Sortieren nach',
      resultsOne:'{count} Ergebnis', resultsOther:'{count} Ergebnisse', selectAll:'Alle auswählen', deselectAll:'Auswahl aufheben',
      clearSelection:'Auswahl löschen', selectedOne:'{count} ausgewählt', selectedOther:'{count} ausgewählt', noPending:'Keine ausstehende Aktion',
      archive:'Archivieren', restore:'Wiederherstellen', delete:'Löschen', cancel:'Abbrechen', deleteTitle:'Unterhaltungen löschen?',
      searchProject:'Projekt suchen…', noProjectFound:'Kein Projekt gefunden', noSelected:'Keine Unterhaltung ausgewählt', noConversation:'Keine Unterhaltung',
      trySearch:'Versuche eine andere Suche.', adjustFilters:'Passe die Filter an, um mehr Chats anzuzeigen.', archived:'Archiviert', untitled:'Ohne Titel',
      outsideProject:'Außerhalb eines Projekts', open:'Öffnen', openConversation:'Unterhaltung öffnen', showMore:'Weitere {count} anzeigen',
      selectedMixed:'{active} aktiv · {archived} archiviert', selectedActive:'{count} aktiv', selectedArchived:'{count} archiviert',
      deleteConfirmOne:'{count} Unterhaltung wird aus deinem ChatGPT-Verlauf gelöscht. Dies kann in diesem Tool nicht rückgängig gemacht werden.',
      deleteConfirmOther:'{count} Unterhaltungen werden aus deinem ChatGPT-Verlauf gelöscht. Dies kann in diesem Tool nicht rückgängig gemacht werden.',
      archiving:'Archivieren', restoring:'Wiederherstellen', deleting:'Löschen', doneArchived:'archiviert', doneRestored:'wiederhergestellt', doneDeleted:'gelöscht',
      failureOne:'{count} Fehler', failureOther:'{count} Fehler', loadingConversations:'Unterhaltungen werden geladen…', upToDate:'Aktuell', error:'Fehler',
      today:'Heute', yesterday:'Gestern', project:'Projekt', unnamedProject:'Unbenanntes Projekt', manageConversations:'ChatGPT-Unterhaltungsverwaltung'
    },
    it: {
      launcherChats:'Chat', manageChats:'Gestisci chat', conversations:'conversazioni', projects:'progetti', refresh:'Aggiorna', close:'Chiudi',
      searchChats:'Cerca nelle conversazioni…', active:'Attive', archives:'Archivio', selection:'Selezione',
      scopeAll:'Tutte le chat', scopeProjects:'Nei progetti', scopeOutside:'Fuori dai progetti', projectAll:'Tutti i progetti',
      sortRecent:'Recenti', sortOld:'Meno recenti', sortAZ:'A → Z', sortProject:'Per progetto', show:'Mostra', sortBy:'Ordina per',
      resultsOne:'{count} risultato', resultsOther:'{count} risultati', selectAll:'Seleziona tutto', deselectAll:'Deseleziona tutto',
      clearSelection:'Cancella selezione', selectedOne:'{count} selezionata', selectedOther:'{count} selezionate', noPending:'Nessuna azione in attesa',
      archive:'Archivia', restore:'Ripristina', delete:'Elimina', cancel:'Annulla', deleteTitle:'Eliminare le conversazioni?',
      searchProject:'Cerca un progetto…', noProjectFound:'Nessun progetto trovato', noSelected:'Nessuna conversazione selezionata', noConversation:'Nessuna conversazione',
      trySearch:'Prova un’altra ricerca.', adjustFilters:'Modifica i filtri per mostrare più chat.', archived:'Archiviata', untitled:'Senza titolo',
      outsideProject:'Fuori progetto', open:'Apri', openConversation:'Apri conversazione', showMore:'Mostra altre {count}',
      selectedMixed:'{active} attive · {archived} archiviate', selectedActive:'{count} attive', selectedArchived:'{count} archiviate',
      deleteConfirmOne:'{count} conversazione verrà rimossa dalla cronologia di ChatGPT. Non può essere annullato da questo strumento.',
      deleteConfirmOther:'{count} conversazioni verranno rimosse dalla cronologia di ChatGPT. Non può essere annullato da questo strumento.',
      archiving:'Archiviazione', restoring:'Ripristino', deleting:'Eliminazione', doneArchived:'archiviate', doneRestored:'ripristinate', doneDeleted:'eliminate',
      failureOne:'{count} errore', failureOther:'{count} errori', loadingConversations:'Caricamento conversazioni…', upToDate:'Aggiornato', error:'Errore',
      today:'Oggi', yesterday:'Ieri', project:'Progetto', unnamedProject:'Progetto senza nome', manageConversations:'Gestore conversazioni ChatGPT'
    },
    pt: {
      launcherChats:'Chats', manageChats:'Gerir chats', conversations:'conversas', projects:'projetos', refresh:'Atualizar', close:'Fechar',
      searchChats:'Pesquisar conversas…', active:'Ativos', archives:'Arquivados', selection:'Seleção',
      scopeAll:'Todos os chats', scopeProjects:'Em projetos', scopeOutside:'Fora de projetos', projectAll:'Todos os projetos',
      sortRecent:'Recentes', sortOld:'Mais antigos', sortAZ:'A → Z', sortProject:'Por projeto', show:'Mostrar', sortBy:'Ordenar por',
      resultsOne:'{count} resultado', resultsOther:'{count} resultados', selectAll:'Selecionar tudo', deselectAll:'Desmarcar tudo',
      clearSelection:'Limpar seleção', selectedOne:'{count} selecionado', selectedOther:'{count} selecionados', noPending:'Nenhuma ação pendente',
      archive:'Arquivar', restore:'Restaurar', delete:'Eliminar', cancel:'Cancelar', deleteTitle:'Eliminar conversas?',
      searchProject:'Pesquisar projeto…', noProjectFound:'Nenhum projeto encontrado', noSelected:'Nenhuma conversa selecionada', noConversation:'Nenhuma conversa',
      trySearch:'Tente outra pesquisa.', adjustFilters:'Altere os filtros para mostrar mais chats.', archived:'Arquivado', untitled:'Sem título',
      outsideProject:'Fora de projeto', open:'Abrir', openConversation:'Abrir conversa', showMore:'Mostrar mais {count}',
      selectedMixed:'{active} ativos · {archived} arquivados', selectedActive:'{count} ativos', selectedArchived:'{count} arquivados',
      deleteConfirmOne:'{count} conversa será removida do histórico do ChatGPT. Isto não pode ser desfeito por esta ferramenta.',
      deleteConfirmOther:'{count} conversas serão removidas do histórico do ChatGPT. Isto não pode ser desfeito por esta ferramenta.',
      archiving:'A arquivar', restoring:'A restaurar', deleting:'A eliminar', doneArchived:'arquivados', doneRestored:'restaurados', doneDeleted:'eliminados',
      failureOne:'{count} falha', failureOther:'{count} falhas', loadingConversations:'A carregar conversas…', upToDate:'Atualizado', error:'Erro',
      today:'Hoje', yesterday:'Ontem', project:'Projeto', unnamedProject:'Projeto sem nome', manageConversations:'Gestor de conversas ChatGPT'
    },
    nl: {
      launcherChats:'Chats', manageChats:'Chats beheren', conversations:'gesprekken', projects:'projecten', refresh:'Vernieuwen', close:'Sluiten',
      searchChats:'Gesprekken zoeken…', active:'Actief', archives:'Archief', selection:'Selectie',
      scopeAll:'Alle chats', scopeProjects:'In projecten', scopeOutside:'Buiten projecten', projectAll:'Alle projecten',
      sortRecent:'Recent', sortOld:'Oudste', sortAZ:'A → Z', sortProject:'Op project', show:'Tonen', sortBy:'Sorteren op',
      resultsOne:'{count} resultaat', resultsOther:'{count} resultaten', selectAll:'Alles selecteren', deselectAll:'Alles deselecteren',
      clearSelection:'Selectie wissen', selectedOne:'{count} geselecteerd', selectedOther:'{count} geselecteerd', noPending:'Geen actie in behandeling',
      archive:'Archiveren', restore:'Herstellen', delete:'Verwijderen', cancel:'Annuleren', deleteTitle:'Gesprekken verwijderen?',
      searchProject:'Project zoeken…', noProjectFound:'Geen project gevonden', noSelected:'Geen gesprek geselecteerd', noConversation:'Geen gesprek',
      trySearch:'Probeer een andere zoekopdracht.', adjustFilters:'Pas de filters aan om meer chats te tonen.', archived:'Gearchiveerd', untitled:'Naamloos',
      outsideProject:'Buiten project', open:'Openen', openConversation:'Gesprek openen', showMore:'Nog {count} tonen',
      selectedMixed:'{active} actief · {archived} gearchiveerd', selectedActive:'{count} actief', selectedArchived:'{count} gearchiveerd',
      deleteConfirmOne:'{count} gesprek wordt uit je ChatGPT-geschiedenis verwijderd. Dit kan vanuit deze tool niet ongedaan worden gemaakt.',
      deleteConfirmOther:'{count} gesprekken worden uit je ChatGPT-geschiedenis verwijderd. Dit kan vanuit deze tool niet ongedaan worden gemaakt.',
      archiving:'Archiveren', restoring:'Herstellen', deleting:'Verwijderen', doneArchived:'gearchiveerd', doneRestored:'hersteld', doneDeleted:'verwijderd',
      failureOne:'{count} fout', failureOther:'{count} fouten', loadingConversations:'Gesprekken laden…', upToDate:'Bijgewerkt', error:'Fout',
      today:'Vandaag', yesterday:'Gisteren', project:'Project', unnamedProject:'Naamloos project', manageConversations:'ChatGPT-gespreksbeheer'
    },
    pl: {
      launcherChats:'Czaty', manageChats:'Zarządzaj czatami', conversations:'rozmów', projects:'projektów', refresh:'Odśwież', close:'Zamknij',
      searchChats:'Szukaj rozmów…', active:'Aktywne', archives:'Archiwum', selection:'Zaznaczone',
      scopeAll:'Wszystkie czaty', scopeProjects:'W projektach', scopeOutside:'Poza projektami', projectAll:'Wszystkie projekty',
      sortRecent:'Najnowsze', sortOld:'Najstarsze', sortAZ:'A → Z', sortProject:'Według projektu', show:'Pokaż', sortBy:'Sortuj według',
      resultsOne:'{count} wynik', resultsOther:'{count} wyników', selectAll:'Zaznacz wszystko', deselectAll:'Odznacz wszystko',
      clearSelection:'Wyczyść zaznaczenie', selectedOne:'{count} zaznaczono', selectedOther:'{count} zaznaczono', noPending:'Brak oczekujących działań',
      archive:'Archiwizuj', restore:'Przywróć', delete:'Usuń', cancel:'Anuluj', deleteTitle:'Usunąć rozmowy?',
      searchProject:'Szukaj projektu…', noProjectFound:'Nie znaleziono projektu', noSelected:'Nie zaznaczono rozmowy', noConversation:'Brak rozmów',
      trySearch:'Spróbuj innego wyszukiwania.', adjustFilters:'Zmień filtry, aby wyświetlić więcej czatów.', archived:'Zarchiwizowano', untitled:'Bez tytułu',
      outsideProject:'Poza projektem', open:'Otwórz', openConversation:'Otwórz rozmowę', showMore:'Pokaż jeszcze {count}',
      selectedMixed:'{active} aktywnych · {archived} zarchiwizowanych', selectedActive:'{count} aktywnych', selectedArchived:'{count} zarchiwizowanych',
      deleteConfirmOne:'{count} rozmowa zostanie usunięta z historii ChatGPT. Tego działania nie można cofnąć w tym narzędziu.',
      deleteConfirmOther:'{count} rozmów zostanie usuniętych z historii ChatGPT. Tego działania nie można cofnąć w tym narzędziu.',
      archiving:'Archiwizowanie', restoring:'Przywracanie', deleting:'Usuwanie', doneArchived:'zarchiwizowano', doneRestored:'przywrócono', doneDeleted:'usunięto',
      failureOne:'{count} błąd', failureOther:'{count} błędów', loadingConversations:'Ładowanie rozmów…', upToDate:'Aktualne', error:'Błąd',
      today:'Dzisiaj', yesterday:'Wczoraj', project:'Projekt', unnamedProject:'Projekt bez nazwy', manageConversations:'Menedżer rozmów ChatGPT'
    },
    tr: {
      launcherChats:'Sohbetler', manageChats:'Sohbetleri yönet', conversations:'sohbet', projects:'proje', refresh:'Yenile', close:'Kapat',
      searchChats:'Sohbetlerde ara…', active:'Aktif', archives:'Arşiv', selection:'Seçilenler',
      scopeAll:'Tüm sohbetler', scopeProjects:'Projelerde', scopeOutside:'Projeler dışında', projectAll:'Tüm projeler',
      sortRecent:'En yeni', sortOld:'En eski', sortAZ:'A → Z', sortProject:'Projeye göre', show:'Göster', sortBy:'Sırala',
      resultsOne:'{count} sonuç', resultsOther:'{count} sonuç', selectAll:'Tümünü seç', deselectAll:'Tüm seçimi kaldır',
      clearSelection:'Seçimi temizle', selectedOne:'{count} seçili', selectedOther:'{count} seçili', noPending:'Bekleyen işlem yok',
      archive:'Arşivle', restore:'Geri yükle', delete:'Sil', cancel:'İptal', deleteTitle:'Sohbetler silinsin mi?',
      searchProject:'Proje ara…', noProjectFound:'Proje bulunamadı', noSelected:'Sohbet seçilmedi', noConversation:'Sohbet yok',
      trySearch:'Başka bir arama deneyin.', adjustFilters:'Daha fazla sohbet göstermek için filtreleri değiştirin.', archived:'Arşivlendi', untitled:'Başlıksız',
      outsideProject:'Proje dışında', open:'Aç', openConversation:'Sohbeti aç', showMore:'{count} tane daha göster',
      selectedMixed:'{active} aktif · {archived} arşivlenmiş', selectedActive:'{count} aktif', selectedArchived:'{count} arşivlenmiş',
      deleteConfirmOne:'{count} sohbet ChatGPT geçmişinizden silinecek. Bu araçtan geri alınamaz.',
      deleteConfirmOther:'{count} sohbet ChatGPT geçmişinizden silinecek. Bu araçtan geri alınamaz.',
      archiving:'Arşivleniyor', restoring:'Geri yükleniyor', deleting:'Siliniyor', doneArchived:'arşivlendi', doneRestored:'geri yüklendi', doneDeleted:'silindi',
      failureOne:'{count} hata', failureOther:'{count} hata', loadingConversations:'Sohbetler yükleniyor…', upToDate:'Güncel', error:'Hata',
      today:'Bugün', yesterday:'Dün', project:'Proje', unnamedProject:'Adsız proje', manageConversations:'ChatGPT sohbet yöneticisi'
    },
    ru: {
      launcherChats:'Чаты', manageChats:'Управление чатами', conversations:'диалогов', projects:'проектов', refresh:'Обновить', close:'Закрыть',
      searchChats:'Поиск по диалогам…', active:'Активные', archives:'Архив', selection:'Выбрано',
      scopeAll:'Все чаты', scopeProjects:'В проектах', scopeOutside:'Вне проектов', projectAll:'Все проекты',
      sortRecent:'Новые', sortOld:'Старые', sortAZ:'А → Я', sortProject:'По проекту', show:'Показать', sortBy:'Сортировка',
      resultsOne:'{count} результат', resultsOther:'{count} результатов', selectAll:'Выбрать все', deselectAll:'Снять выделение',
      clearSelection:'Очистить выбор', selectedOne:'{count} выбрано', selectedOther:'{count} выбрано', noPending:'Нет ожидающих действий',
      archive:'В архив', restore:'Восстановить', delete:'Удалить', cancel:'Отмена', deleteTitle:'Удалить диалоги?',
      searchProject:'Поиск проекта…', noProjectFound:'Проект не найден', noSelected:'Диалоги не выбраны', noConversation:'Нет диалогов',
      trySearch:'Попробуйте другой запрос.', adjustFilters:'Измените фильтры, чтобы показать больше чатов.', archived:'В архиве', untitled:'Без названия',
      outsideProject:'Вне проекта', open:'Открыть', openConversation:'Открыть диалог', showMore:'Показать ещё {count}',
      selectedMixed:'{active} активных · {archived} в архиве', selectedActive:'{count} активных', selectedArchived:'{count} в архиве',
      deleteConfirmOne:'{count} диалог будет удалён из истории ChatGPT. Отменить это действие в этом инструменте нельзя.',
      deleteConfirmOther:'{count} диалогов будут удалены из истории ChatGPT. Отменить это действие в этом инструменте нельзя.',
      archiving:'Архивация', restoring:'Восстановление', deleting:'Удаление', doneArchived:'архивировано', doneRestored:'восстановлено', doneDeleted:'удалено',
      failureOne:'{count} ошибка', failureOther:'{count} ошибок', loadingConversations:'Загрузка диалогов…', upToDate:'Актуально', error:'Ошибка',
      today:'Сегодня', yesterday:'Вчера', project:'Проект', unnamedProject:'Проект без названия', manageConversations:'Менеджер диалогов ChatGPT'
    },
    ja: {
      launcherChats:'チャット', manageChats:'チャットを管理', conversations:'件の会話', projects:'件のプロジェクト', refresh:'更新', close:'閉じる',
      searchChats:'会話を検索…', active:'アクティブ', archives:'アーカイブ', selection:'選択済み',
      scopeAll:'すべてのチャット', scopeProjects:'プロジェクト内', scopeOutside:'プロジェクト外', projectAll:'すべてのプロジェクト',
      sortRecent:'新しい順', sortOld:'古い順', sortAZ:'A → Z', sortProject:'プロジェクト順', show:'表示', sortBy:'並べ替え',
      resultsOne:'{count} 件', resultsOther:'{count} 件', selectAll:'すべて選択', deselectAll:'すべて解除',
      clearSelection:'選択を解除', selectedOne:'{count} 件選択', selectedOther:'{count} 件選択', noPending:'保留中の操作はありません',
      archive:'アーカイブ', restore:'復元', delete:'削除', cancel:'キャンセル', deleteTitle:'会話を削除しますか？',
      searchProject:'プロジェクトを検索…', noProjectFound:'プロジェクトが見つかりません', noSelected:'会話が選択されていません', noConversation:'会話がありません',
      trySearch:'別の検索を試してください。', adjustFilters:'フィルターを変更して、さらにチャットを表示してください。', archived:'アーカイブ済み', untitled:'無題',
      outsideProject:'プロジェクト外', open:'開く', openConversation:'会話を開く', showMore:'さらに {count} 件表示',
      selectedMixed:'アクティブ {active} · アーカイブ {archived}', selectedActive:'アクティブ {count}', selectedArchived:'アーカイブ {count}',
      deleteConfirmOne:'ChatGPT の履歴から {count} 件の会話を削除します。このツールから元に戻すことはできません。',
      deleteConfirmOther:'ChatGPT の履歴から {count} 件の会話を削除します。このツールから元に戻すことはできません。',
      archiving:'アーカイブ中', restoring:'復元中', deleting:'削除中', doneArchived:'アーカイブ済み', doneRestored:'復元済み', doneDeleted:'削除済み',
      failureOne:'{count} 件失敗', failureOther:'{count} 件失敗', loadingConversations:'会話を読み込み中…', upToDate:'最新です', error:'エラー',
      today:'今日', yesterday:'昨日', project:'プロジェクト', unnamedProject:'名称未設定のプロジェクト', manageConversations:'ChatGPT 会話マネージャー'
    },
    ko: {
      launcherChats:'채팅', manageChats:'채팅 관리', conversations:'개 대화', projects:'개 프로젝트', refresh:'새로고침', close:'닫기',
      searchChats:'대화 검색…', active:'활성', archives:'보관됨', selection:'선택됨',
      scopeAll:'모든 채팅', scopeProjects:'프로젝트 내', scopeOutside:'프로젝트 외', projectAll:'모든 프로젝트',
      sortRecent:'최신순', sortOld:'오래된순', sortAZ:'A → Z', sortProject:'프로젝트별', show:'표시', sortBy:'정렬',
      resultsOne:'{count}개 결과', resultsOther:'{count}개 결과', selectAll:'모두 선택', deselectAll:'모두 선택 해제',
      clearSelection:'선택 지우기', selectedOne:'{count}개 선택됨', selectedOther:'{count}개 선택됨', noPending:'대기 중인 작업 없음',
      archive:'보관', restore:'복원', delete:'삭제', cancel:'취소', deleteTitle:'대화를 삭제할까요?',
      searchProject:'프로젝트 검색…', noProjectFound:'프로젝트를 찾을 수 없음', noSelected:'선택된 대화 없음', noConversation:'대화 없음',
      trySearch:'다른 검색어를 사용해 보세요.', adjustFilters:'필터를 변경해 더 많은 채팅을 표시하세요.', archived:'보관됨', untitled:'제목 없음',
      outsideProject:'프로젝트 외', open:'열기', openConversation:'대화 열기', showMore:'{count}개 더 표시',
      selectedMixed:'활성 {active} · 보관 {archived}', selectedActive:'활성 {count}', selectedArchived:'보관 {count}',
      deleteConfirmOne:'ChatGPT 기록에서 {count}개의 대화가 삭제됩니다. 이 도구에서는 되돌릴 수 없습니다.',
      deleteConfirmOther:'ChatGPT 기록에서 {count}개의 대화가 삭제됩니다. 이 도구에서는 되돌릴 수 없습니다.',
      archiving:'보관 중', restoring:'복원 중', deleting:'삭제 중', doneArchived:'보관됨', doneRestored:'복원됨', doneDeleted:'삭제됨',
      failureOne:'{count}개 실패', failureOther:'{count}개 실패', loadingConversations:'대화 불러오는 중…', upToDate:'최신 상태', error:'오류',
      today:'오늘', yesterday:'어제', project:'프로젝트', unnamedProject:'이름 없는 프로젝트', manageConversations:'ChatGPT 대화 관리자'
    },
    zh: {
      launcherChats:'聊天', manageChats:'管理聊天', conversations:'个对话', projects:'个项目', refresh:'刷新', close:'关闭',
      searchChats:'搜索对话…', active:'活跃', archives:'已归档', selection:'已选择',
      scopeAll:'所有聊天', scopeProjects:'项目内', scopeOutside:'项目外', projectAll:'所有项目',
      sortRecent:'最新', sortOld:'最早', sortAZ:'A → Z', sortProject:'按项目', show:'显示', sortBy:'排序方式',
      resultsOne:'{count} 个结果', resultsOther:'{count} 个结果', selectAll:'全选', deselectAll:'取消全选',
      clearSelection:'清除选择', selectedOne:'已选择 {count} 个', selectedOther:'已选择 {count} 个', noPending:'没有待处理操作',
      archive:'归档', restore:'恢复', delete:'删除', cancel:'取消', deleteTitle:'删除对话？',
      searchProject:'搜索项目…', noProjectFound:'未找到项目', noSelected:'未选择对话', noConversation:'没有对话',
      trySearch:'请尝试其他搜索。', adjustFilters:'调整筛选条件以显示更多聊天。', archived:'已归档', untitled:'无标题',
      outsideProject:'项目外', open:'打开', openConversation:'打开对话', showMore:'再显示 {count} 个',
      selectedMixed:'活跃 {active} · 已归档 {archived}', selectedActive:'活跃 {count}', selectedArchived:'已归档 {count}',
      deleteConfirmOne:'将从 ChatGPT 历史记录中删除 {count} 个对话。此工具无法撤销该操作。',
      deleteConfirmOther:'将从 ChatGPT 历史记录中删除 {count} 个对话。此工具无法撤销该操作。',
      archiving:'正在归档', restoring:'正在恢复', deleting:'正在删除', doneArchived:'已归档', doneRestored:'已恢复', doneDeleted:'已删除',
      failureOne:'{count} 个失败', failureOther:'{count} 个失败', loadingConversations:'正在加载对话…', upToDate:'已更新', error:'错误',
      today:'今天', yesterday:'昨天', project:'项目', unnamedProject:'未命名项目', manageConversations:'ChatGPT 对话管理器'
    },
    'zh-TW': {
      launcherChats:'聊天', manageChats:'管理聊天', conversations:'個對話', projects:'個專案', refresh:'重新整理', close:'關閉',
      searchChats:'搜尋對話…', active:'使用中', archives:'已封存', selection:'已選取',
      scopeAll:'所有聊天', scopeProjects:'專案內', scopeOutside:'專案外', projectAll:'所有專案',
      sortRecent:'最新', sortOld:'最舊', sortAZ:'A → Z', sortProject:'依專案', show:'顯示', sortBy:'排序方式',
      resultsOne:'{count} 個結果', resultsOther:'{count} 個結果', selectAll:'全選', deselectAll:'取消全選',
      clearSelection:'清除選取', selectedOne:'已選取 {count} 個', selectedOther:'已選取 {count} 個', noPending:'沒有待處理操作',
      archive:'封存', restore:'還原', delete:'刪除', cancel:'取消', deleteTitle:'刪除對話？',
      searchProject:'搜尋專案…', noProjectFound:'找不到專案', noSelected:'未選取對話', noConversation:'沒有對話',
      trySearch:'請嘗試其他搜尋。', adjustFilters:'調整篩選條件以顯示更多聊天。', archived:'已封存', untitled:'無標題',
      outsideProject:'專案外', open:'開啟', openConversation:'開啟對話', showMore:'再顯示 {count} 個',
      selectedMixed:'使用中 {active} · 已封存 {archived}', selectedActive:'使用中 {count}', selectedArchived:'已封存 {count}',
      deleteConfirmOne:'將從 ChatGPT 歷史記錄中刪除 {count} 個對話。此工具無法復原此操作。',
      deleteConfirmOther:'將從 ChatGPT 歷史記錄中刪除 {count} 個對話。此工具無法復原此操作。',
      archiving:'正在封存', restoring:'正在還原', deleting:'正在刪除', doneArchived:'已封存', doneRestored:'已還原', doneDeleted:'已刪除',
      failureOne:'{count} 個失敗', failureOther:'{count} 個失敗', loadingConversations:'正在載入對話…', upToDate:'已更新', error:'錯誤',
      today:'今天', yesterday:'昨天', project:'專案', unnamedProject:'未命名專案', manageConversations:'ChatGPT 對話管理器'
    },
    ar: {
      launcherChats:'الدردشات', manageChats:'إدارة الدردشات', conversations:'محادثات', projects:'مشاريع', refresh:'تحديث', close:'إغلاق',
      searchChats:'البحث في المحادثات…', active:'النشطة', archives:'الأرشيف', selection:'المحددة',
      scopeAll:'كل الدردشات', scopeProjects:'داخل المشاريع', scopeOutside:'خارج المشاريع', projectAll:'كل المشاريع',
      sortRecent:'الأحدث', sortOld:'الأقدم', sortAZ:'A → Z', sortProject:'حسب المشروع', show:'عرض', sortBy:'ترتيب حسب',
      resultsOne:'{count} نتيجة', resultsOther:'{count} نتائج', selectAll:'تحديد الكل', deselectAll:'إلغاء تحديد الكل',
      clearSelection:'مسح التحديد', selectedOne:'تم تحديد {count}', selectedOther:'تم تحديد {count}', noPending:'لا توجد إجراءات معلقة',
      archive:'أرشفة', restore:'استعادة', delete:'حذف', cancel:'إلغاء', deleteTitle:'حذف المحادثات؟',
      searchProject:'البحث عن مشروع…', noProjectFound:'لم يتم العثور على مشروع', noSelected:'لم يتم تحديد محادثة', noConversation:'لا توجد محادثات',
      trySearch:'جرّب بحثًا آخر.', adjustFilters:'غيّر عوامل التصفية لعرض المزيد من الدردشات.', archived:'مؤرشف', untitled:'بلا عنوان',
      outsideProject:'خارج المشروع', open:'فتح', openConversation:'فتح المحادثة', showMore:'عرض {count} إضافية',
      selectedMixed:'{active} نشطة · {archived} مؤرشفة', selectedActive:'{count} نشطة', selectedArchived:'{count} مؤرشفة',
      deleteConfirmOne:'سيتم حذف {count} محادثة من سجل ChatGPT. لا يمكن التراجع عن ذلك من هذه الأداة.',
      deleteConfirmOther:'سيتم حذف {count} محادثات من سجل ChatGPT. لا يمكن التراجع عن ذلك من هذه الأداة.',
      archiving:'جارٍ الأرشفة', restoring:'جارٍ الاستعادة', deleting:'جارٍ الحذف', doneArchived:'تمت أرشفتها', doneRestored:'تمت استعادتها', doneDeleted:'تم حذفها',
      failureOne:'{count} فشل', failureOther:'{count} حالات فشل', loadingConversations:'جارٍ تحميل المحادثات…', upToDate:'محدّث', error:'خطأ',
      today:'اليوم', yesterday:'أمس', project:'مشروع', unnamedProject:'مشروع بلا اسم', manageConversations:'مدير محادثات ChatGPT'
    }
  };

  let localeKey = 'en';
  let localeTag = 'en-US';

  function resolveLocale() {
    const candidates = [document.documentElement.lang, ...(navigator.languages || []), navigator.language].filter(Boolean);
    for (const raw of candidates) {
      const tag = String(raw).replace('_', '-');
      const lower = tag.toLowerCase();
      if (lower.startsWith('zh')) {
        const traditional = /(^|[-])(tw|hk|mo|hant)([-]|$)/i.test(tag);
        return { key: traditional ? 'zh-TW' : 'zh', tag };
      }
      const base = lower.split('-')[0];
      if (I18N[base]) return { key: base, tag };
    }
    return { key: 'en', tag: 'en-US' };
  }

  function refreshLocale() {
    const next = resolveLocale();
    const changed = next.key !== localeKey || next.tag !== localeTag;
    localeKey = next.key;
    localeTag = next.tag;
    if (ui.root) ui.root.dir = localeKey === 'ar' ? 'rtl' : 'ltr';
    return changed;
  }

  function t(key, vars = {}) {
    const pack = I18N[localeKey] || I18N.en;
    let value = pack[key] ?? I18N.en[key] ?? key;
    return String(value).replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? `{${name}}`);
  }

  function tp(oneKey, otherKey, count, vars = {}) {
    return t(count === 1 ? oneKey : otherKey, { count, ...vars });
  }

  const state = {
    view: 'active', // active | archived | selected
    query: '',
    scope: 'all', // all | projects | outside
    projectId: 'all',
    sort: 'updated_desc', // updated_desc | updated_asc | title_asc | project_asc
  };

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const ICONS = {
    trash: '<svg viewBox="0 0 24 24"><path d="M4 6h16M8 6V4h8v2M18 6l-1 14H7L6 6M10 10v6M14 10v6"/></svg>',
    archive: '<svg viewBox="0 0 24 24"><path d="M4 8h16v11H4zM3 5h18v3H3zM9 12h6"/></svg>',
    restore: '<svg viewBox="0 0 24 24"><path d="M4 8h16v11H4zM3 5h18v3H3zM12 16v-5M9.5 13.5 12 11l2.5 2.5"/></svg>',
    refresh: '<svg viewBox="0 0 24 24"><path d="M20 6v5h-5"/><path d="M19 11a7 7 0 1 0 1 5"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>',
    external: '<svg viewBox="0 0 24 24"><path d="M8 16 16 8M10 8h6v6"/></svg>',
    folder: '<svg viewBox="0 0 24 24"><path d="M3 7h6l2 2h10v10H3z"/></svg>',
    chevron: '<svg viewBox="0 0 24 24"><path d="m9 10 3 3 3-3"/></svg>',
    filter: '<svg viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M14 5v4M4 17h2M10 17h10M6 15v4M4 12h5M13 12h7M9 10v4"/></svg>',
    sort: '<svg viewBox="0 0 24 24"><path d="M8 6h8M6 10h12M4 14h16M9 18h6"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg>',
    chats: '<svg viewBox="0 0 24 24"><path d="M5 5h14v11H9l-4 3z"/></svg>',
  };

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function timeValue(value) {
    if (!value) return 0;
    if (typeof value === 'number') return value < 1e12 ? value * 1000 : value;
    const n = Number(value);
    if (Number.isFinite(n) && String(value).trim() !== '') return n < 1e12 ? n * 1000 : n;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatDate(value) {
    const ms = timeValue(value);
    if (!ms) return '';
    const date = new Date(ms);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return `${t('today')}, ${date.toLocaleTimeString(localeTag, { hour: '2-digit', minute: '2-digit' })}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return t('yesterday');

    return date.toLocaleDateString(localeTag, {
      day: '2-digit',
      month: 'short',
      year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
    });
  }

  function isProjectConversation(c) {
    return typeof c?.gizmo_id === 'string' && c.gizmo_id.startsWith('g-p-');
  }

  function projectNameFor(c) {
    if (!isProjectConversation(c)) return null;
    return c.project_name || projects.find(p => p.id === c.gizmo_id)?.name || t('project');
  }

  async function getAccessToken() {
    const res = await fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' });
    if (!res.ok) throw new Error(`Session inaccessible (${res.status})`);
    const data = await res.json();
    if (!data.accessToken) throw new Error('Access token unavailable');
    return data.accessToken;
  }

  function authHeaders(extra = {}) {
    return { Authorization: `Bearer ${accessToken}`, ...extra };
  }

  async function apiFetch(url, options = {}) {
    return fetch(url, {
      credentials: 'include',
      cache: 'no-store',
      ...options,
      headers: authHeaders(options.headers || {}),
    });
  }

  async function fetchConversationPass(isArchived) {
    const result = [];
    const seen = new Set();
    let offset = 0;

    for (let page = 0; page < 1000; page++) {
      const params = new URLSearchParams({
        offset: String(offset),
        limit: String(CONFIG.PAGE_SIZE),
        order: 'updated',
        is_archived: String(isArchived),
      });

      const res = await apiFetch(`/backend-api/conversations?${params}`);
      if (!res.ok) throw new Error(`${isArchived ? 'Archives' : 'Chats'} : HTTP ${res.status}`);

      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : [];

      for (const item of items) {
        if (!item?.id || seen.has(item.id)) continue;
        seen.add(item.id);
        result.push({ ...item, is_archived: isArchived || Boolean(item.is_archived) });
      }

      if (!items.length) break;
      const total = Number(data?.total);
      if (Number.isFinite(total) && offset + items.length >= total) break;
      if (data?.has_more === false || data?.hasMore === false) break;
      if (items.length < CONFIG.PAGE_SIZE) break;
      offset += items.length;
    }

    return result;
  }

  function extractProject(item) {
    const g = item?.gizmo?.gizmo || item?.gizmo || item;
    const id = g?.id;
    if (!id || !String(id).startsWith('g-p-')) return null;
    return {
      id,
      name: g?.display?.name || g?.name || t('unnamedProject'),
    };
  }

  async function fetchProjects() {
    const output = [];
    const seenIds = new Set();
    const seenCursors = new Set();
    let cursor = null;

    for (let page = 0; page < 100; page++) {
      const params = new URLSearchParams({
        owned_only: 'true',
        conversations_per_gizmo: '0',
        limit: '100',
      });
      if (cursor) params.set('cursor', cursor);

      const res = await apiFetch(`/backend-api/gizmos/snorlax/sidebar?${params}`);
      if (!res.ok) throw new Error(`Projets : HTTP ${res.status}`);

      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : [];

      for (const item of items) {
        const project = extractProject(item);
        if (!project || seenIds.has(project.id)) continue;
        seenIds.add(project.id);
        output.push(project);
      }

      const next = data?.cursor || data?.next_cursor || null;
      if (!next || seenCursors.has(next)) break;
      seenCursors.add(next);
      cursor = next;
    }

    return output.sort((a, b) => a.name.localeCompare(b.name, localeTag, { sensitivity: 'base' }));
  }

  async function fetchProjectConversations(project) {
    const output = [];
    const seenIds = new Set();
    const seenCursors = new Set();
    let cursor = '0';

    for (let page = 0; page < 1000; page++) {
      const res = await apiFetch(
        `/backend-api/gizmos/${encodeURIComponent(project.id)}/conversations?cursor=${encodeURIComponent(cursor)}`
      );
      if (!res.ok) throw new Error(`${project.name} : HTTP ${res.status}`);

      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : [];

      for (const item of items) {
        if (!item?.id || seenIds.has(item.id)) continue;
        seenIds.add(item.id);
        output.push({
          ...item,
          gizmo_id: item.gizmo_id || project.id,
          project_name: project.name,
          is_archived: Boolean(item.is_archived),
        });
      }

      const next = data?.cursor ?? data?.next_cursor ?? null;
      if (!next || seenCursors.has(String(next))) break;
      seenCursors.add(String(next));
      cursor = String(next);
    }

    return output;
  }

  async function fetchAllProjectConversations(projectList, generation) {
    const results = [];
    let index = 0;

    async function worker() {
      while (index < projectList.length) {
        if (generation !== loadGeneration) return;
        const current = projectList[index++];
        setToast(`Projets ${Math.min(index, projectList.length)}/${projectList.length}…`, true);
        try {
          const items = await fetchProjectConversations(current);
          results.push(...items);
        } catch (error) {
          console.warn('[ChatGPT Cleaner] Project skipped:', current.name, error);
        }
      }
    }

    const workers = Array.from(
      { length: Math.min(CONFIG.PROJECT_CONCURRENCY, projectList.length) },
      () => worker()
    );
    await Promise.all(workers);
    return results;
  }

  function mergeConversationSources(...sources) {
    const map = new Map();
    for (const source of sources) {
      for (const item of source || []) {
        if (!item?.id) continue;
        const previous = map.get(item.id) || {};
        map.set(item.id, {
          ...previous,
          ...item,
          is_archived: Boolean(previous.is_archived || item.is_archived),
        });
      }
    }
    return [...map.values()].sort((a, b) => timeValue(b.update_time) - timeValue(a.update_time));
  }

  async function patchConversation(id, payload) {
    return apiFetch(`/backend-api/conversation/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  async function patchWithRetry(id, payload) {
    for (let attempt = 1; attempt <= CONFIG.RETRIES; attempt++) {
      try {
        const res = await patchConversation(id, payload);
        if (res.ok) return true;
        if (res.status !== 429 && res.status < 500) return false;
      } catch {}
      await sleep(500 * attempt);
    }
    return false;
  }

  function injectStyles() {
    if (document.getElementById('cclean-v9-style')) return;
    const style = document.createElement('style');
    style.id = 'cclean-v9-style';
    style.textContent = `
      #cclean-root{
        --bg:#fff;--surface:#f7f7f7;--surface2:#ececec;--hover:#f3f3f3;--selected:#ededed;
        --text:#202123;--muted:#6e6e73;--faint:#9a9a9f;--line:rgba(0,0,0,.055);
        --menu:#fff;--danger:#d00e17;--danger-soft:rgba(208,14,23,.085);
        --shadow:0 18px 58px rgba(0,0,0,.16),0 2px 8px rgba(0,0,0,.045);
        --menu-shadow:0 14px 42px rgba(0,0,0,.16),0 2px 8px rgba(0,0,0,.05);
        font-family:var(--font-sans,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif);
        font-size:14px;
        line-height:1.4;
        font-weight:400;
        letter-spacing:normal;
        -webkit-font-smoothing:antialiased;
        text-rendering:optimizeLegibility;
      }
      #cclean-root[data-theme="dark"]{
        --bg:#212121;--surface:#2f2f2f;--surface2:#3a3a3a;--hover:#292929;--selected:#303030;
        --text:#ececec;--muted:#b4b4b4;--faint:#7f7f7f;--line:rgba(255,255,255,.055);
        --menu:#2b2b2b;--danger:#ff4d55;--danger-soft:rgba(255,77,85,.10);
        --shadow:0 22px 68px rgba(0,0,0,.46),0 2px 10px rgba(0,0,0,.16);
        --menu-shadow:0 16px 44px rgba(0,0,0,.44),0 2px 10px rgba(0,0,0,.20);
      }
      #cclean-root *,#cclean-root *:before,#cclean-root *:after{box-sizing:border-box}
      #cclean-root button,#cclean-root input{font-family:inherit;font-size:inherit;line-height:inherit;letter-spacing:inherit}
      #cclean-root svg{fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}

      #cclean-launcher{position:fixed;right:18px;bottom:18px;z-index:2147483644;height:42px;padding:0 13px;border:0;border-radius:13px;background:var(--surface);color:var(--text);box-shadow:0 4px 16px rgba(0,0,0,.13);display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500;cursor:pointer;transition:background .12s ease,transform .12s ease}
      #cclean-launcher:hover{background:var(--surface2);transform:translateY(-1px)}
      #cclean-launcher>svg{width:17px;height:17px}
      #cclean-badge{display:none;min-width:19px;height:19px;padding:0 6px;border-radius:10px;background:var(--text);color:var(--bg);align-items:center;justify-content:center;font-size:10.5px;font-weight:600}
      #cclean-badge.on{display:flex}

      #cclean-panel{position:fixed;right:16px;bottom:68px;z-index:2147483645;width:432px;height:min(620px,calc(100vh - 88px));display:none;flex-direction:column;overflow:hidden;background:var(--bg);color:var(--text);border:0;border-radius:17px;box-shadow:var(--shadow)}
      #cclean-panel.open{display:flex;animation:ccleanIn .14s cubic-bezier(.2,.8,.2,1)}
      @keyframes ccleanIn{from{opacity:0;transform:translateY(5px) scale(.992)}to{opacity:1;transform:none}}

      .cc-head{height:62px;padding:12px 11px 8px 16px;display:flex;align-items:center;gap:5px;flex:0 0 auto}
      .cc-head-main{min-width:0;flex:1}
      .cc-title{font-size:15.5px;font-weight:600;line-height:1.25;letter-spacing:-.12px}
      .cc-sub{margin-top:3px;color:var(--muted);font-size:11.5px;font-weight:400;line-height:1.25}
      .cc-icon{width:34px;height:34px;border:0;border-radius:9px;background:transparent;color:var(--muted);cursor:pointer;display:grid;place-items:center;transition:background .1s ease,color .1s ease}
      .cc-icon:hover{background:var(--surface);color:var(--text)}
      .cc-icon svg{width:16px;height:16px}
      .cc-icon.loading svg{animation:ccspin .8s linear infinite}
      @keyframes ccspin{to{transform:rotate(360deg)}}

      .cc-search-wrap{padding:5px 13px 9px;flex:0 0 auto}
      .cc-search{height:40px;border-radius:11px;background:var(--surface);display:flex;align-items:center;padding:0 12px;gap:9px;transition:background .1s ease}
      .cc-search:focus-within{background:var(--surface2)}
      .cc-search svg{width:15px;height:15px;color:var(--muted);flex:0 0 15px}
      .cc-search input{min-width:0;width:100%;border:0;outline:0;background:transparent;color:var(--text);font-size:13.5px;font-weight:400}
      .cc-search input::placeholder{color:var(--muted);opacity:.9}

      .cc-tabs{height:43px;padding:2px 13px 7px;display:flex;align-items:center;gap:3px;flex:0 0 auto}
      .cc-tab{height:34px;padding:0 11px;border:0;border-radius:9px;background:transparent;color:var(--muted);font-size:12px;font-weight:500;cursor:pointer;white-space:nowrap;transition:background .1s ease,color .1s ease}
      .cc-tab:hover{background:var(--hover);color:var(--text)}
      .cc-tab.active{background:var(--surface);color:var(--text)}
      .cc-tab-count{margin-left:4px;color:var(--faint);font-size:10.5px;font-weight:500}
      .cc-tab.active .cc-tab-count{color:var(--muted)}

      .cc-toolbar{padding:1px 13px 10px;display:flex;align-items:center;gap:6px;flex:0 0 auto}
      .cc-dropdown-trigger{height:34px;min-width:0;padding:0 9px;border:0;border-radius:9px;background:transparent;color:var(--muted);display:flex;align-items:center;gap:7px;font-size:11.5px;font-weight:500;cursor:pointer;transition:background .1s ease,color .1s ease}
      .cc-dropdown-trigger:hover,.cc-dropdown-trigger.active{background:var(--surface);color:var(--text)}
      .cc-dropdown-trigger>svg:first-child{width:14px;height:14px;flex:0 0 14px}
      .cc-dropdown-trigger .cc-chev{width:13px;height:13px;margin-left:1px;opacity:.68}
      .cc-dropdown-trigger .cc-dd-label{max-width:118px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      #cclean-project-trigger{flex:1;justify-content:flex-start}
      #cclean-project-trigger .cc-dd-label{max-width:158px}
      #cclean-project-trigger.disabled{opacity:.34;pointer-events:none}
      .cc-toolbar-spacer{flex:1}
      .cc-selectall{margin-left:auto;height:32px;padding:0 9px;border:0;border-radius:9px;background:transparent;color:var(--muted);font-size:11.5px;font-weight:500;cursor:pointer;white-space:nowrap}
      .cc-selectall:hover{background:var(--surface);color:var(--text)}

      .cc-list-head{height:32px;padding:0 15px 5px;display:flex;align-items:center;border-bottom:1px solid var(--line);flex:0 0 auto}
      .cc-results{font-size:11px;color:var(--muted);font-weight:400}
      .cc-view-note{margin-left:auto;font-size:10.5px;color:var(--faint)}

      #cclean-list{min-height:0;flex:1;overflow-y:auto;padding:6px 8px 8px;scrollbar-width:thin;scrollbar-color:var(--surface2) transparent}
      #cclean-list::-webkit-scrollbar{width:5px}#cclean-list::-webkit-scrollbar-track{background:transparent}#cclean-list::-webkit-scrollbar-thumb{background:var(--surface2);border-radius:10px}
      .cc-row{min-height:56px;padding:8px 9px;display:flex;align-items:center;gap:10px;border-radius:10px;cursor:pointer;user-select:none;transition:background .08s ease}
      .cc-row+.cc-row{margin-top:1px}
      .cc-row:hover{background:var(--hover)}
      .cc-row.selected{background:var(--selected)}
      .cc-check{width:19px;height:19px;flex:0 0 19px;border:1.25px solid var(--muted);border-radius:5.5px;display:flex;align-items:center;justify-content:center;color:transparent;transition:background .1s ease,border-color .1s ease,color .1s ease}
      .cc-check svg{width:11px;height:11px;stroke-width:2.25}
      .cc-row.selected .cc-check{background:var(--text);border-color:var(--text);color:var(--bg)}
      .cc-row-main{min-width:0;flex:1}
      .cc-row-title{font-size:13.25px;font-weight:500;line-height:1.3;letter-spacing:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .cc-row-meta{margin-top:4px;display:flex;gap:5px;align-items:center;min-width:0;font-size:11px;font-weight:400;line-height:1.2;color:var(--muted)}
      .cc-project{max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-flex;align-items:center;gap:5px}
      .cc-project svg{width:11px;height:11px;flex:0 0 11px;stroke-width:1.6}
      .cc-dot{opacity:.42}
      .cc-open{width:30px;height:30px;flex:0 0 30px;border:0;border-radius:8px;background:transparent;color:var(--muted);cursor:pointer;display:grid;place-items:center;opacity:0;transition:background .1s ease,color .1s ease,opacity .1s ease}
      .cc-row:hover .cc-open,.cc-open:focus-visible{opacity:1}
      .cc-open:hover{background:var(--surface);color:var(--text)}
      .cc-open svg{width:14px;height:14px}
      .cc-empty{height:100%;min-height:170px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:var(--muted);font-size:12px;gap:6px;padding:26px}
      .cc-empty strong{color:var(--text);font-size:13px;font-weight:500}
      .cc-more{width:100%;height:34px;margin-top:5px;border:0;border-radius:9px;background:transparent;color:var(--muted);font-size:11.5px;font-weight:500;cursor:pointer}
      .cc-more:hover{background:var(--surface);color:var(--text)}

      .cc-footer{min-height:64px;padding:10px 12px;display:flex;align-items:center;gap:6px;border-top:1px solid var(--line);flex:0 0 auto;background:var(--bg)}
      .cc-selection{min-width:0;flex:1;display:flex;align-items:center;gap:8px}
      .cc-selection-text{min-width:0}
      .cc-selection strong{display:block;font-size:12px;font-weight:500;line-height:1.25;white-space:nowrap}
      .cc-selection small{display:block;margin-top:3px;font-size:10.5px;font-weight:400;line-height:1.2;color:var(--muted);white-space:nowrap}
      .cc-clear-selection{width:28px;height:28px;border:0;border-radius:8px;background:transparent;color:var(--muted);display:none;place-items:center;cursor:pointer}
      .cc-clear-selection.on{display:grid}
      .cc-clear-selection:hover{background:var(--surface);color:var(--text)}
      .cc-clear-selection svg{width:13px;height:13px}
      .cc-action{height:34px;padding:0 9px;border:0;border-radius:9px;background:transparent;color:var(--muted);font-size:11.25px;font-weight:500;cursor:pointer;white-space:nowrap;display:none;align-items:center;justify-content:center;gap:5px;transition:background .1s ease,color .1s ease}
      .cc-action.on{display:inline-flex}
      .cc-action:hover{background:var(--surface);color:var(--text)}
      .cc-action svg{width:13px;height:13px}
      .cc-action.danger{color:var(--danger)}
      .cc-action.danger:hover{background:var(--danger-soft);color:var(--danger)}

      .cc-menu{position:fixed;z-index:2147483648;display:none;min-width:205px;max-width:300px;padding:7px;background:var(--menu);color:var(--text);border:0;border-radius:13px;box-shadow:var(--menu-shadow);transform-origin:top right}
      .cc-menu.open{display:block;animation:ccmenu .11s ease-out}
      @keyframes ccmenu{from{opacity:0;transform:scale(.985) translateY(-2px)}to{opacity:1;transform:none}}
      .cc-menu-search{padding:4px 4px 7px}
      .cc-menu-searchbox{height:36px;padding:0 10px;border-radius:9px;background:var(--surface);display:flex;align-items:center;gap:8px}
      .cc-menu-searchbox svg{width:14px;height:14px;color:var(--muted)}
      .cc-menu-searchbox input{min-width:0;width:100%;border:0;outline:0;background:transparent;color:var(--text);font-size:12px;font-weight:400}
      .cc-menu-label{padding:9px 9px 5px;color:var(--faint);font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.045em}
      .cc-menu-list{max-height:300px;overflow:auto;scrollbar-width:thin;scrollbar-color:var(--surface2) transparent}
      .cc-menu-item{width:100%;min-height:38px;padding:8px 9px;border:0;border-radius:9px;background:transparent;color:var(--text);display:flex;align-items:center;gap:9px;text-align:left;font-size:12px;font-weight:400;cursor:pointer}
      .cc-menu-item:hover{background:var(--surface)}
      .cc-menu-item .cc-mi-icon{width:16px;height:16px;flex:0 0 16px;color:var(--muted);display:grid;place-items:center}
      .cc-menu-item .cc-mi-icon svg{width:15px;height:15px}
      .cc-menu-item .cc-mi-main{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .cc-menu-item .cc-mi-check{width:15px;height:15px;flex:0 0 15px;color:var(--text);opacity:0}
      .cc-menu-item.selected .cc-mi-check{opacity:1}
      .cc-menu-empty{padding:20px 12px;text-align:center;color:var(--muted);font-size:11.5px}
      .cc-menu-sep{height:1px;background:var(--line);margin:6px 5px}

      .cc-toast{position:absolute;left:50%;bottom:70px;z-index:8;max-width:85%;padding:8px 11px;border-radius:10px;background:var(--menu);color:var(--text);box-shadow:var(--menu-shadow);font-size:11px;font-weight:400;opacity:0;pointer-events:none;transform:translate(-50%,5px);transition:opacity .14s ease,transform .14s ease;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .cc-toast.on{opacity:1;transform:translate(-50%,0)}
      .cc-toast.loading:before{content:"";display:inline-block;width:9px;height:9px;margin-right:7px;border:1.5px solid var(--muted);border-right-color:transparent;border-radius:50%;vertical-align:-1px;animation:ccspin .65s linear infinite}

      .cc-dialog-backdrop{position:absolute;inset:0;z-index:12;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.22);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}
      .cc-dialog-backdrop.open{display:flex}
      .cc-dialog{width:318px;padding:20px;background:var(--menu);border-radius:15px;box-shadow:var(--menu-shadow)}
      .cc-dialog h3{margin:0;font-size:14px;font-weight:600;line-height:1.3;letter-spacing:-.05px}
      .cc-dialog p{margin:9px 0 0;color:var(--muted);font-size:12px;font-weight:400;line-height:1.5}
      .cc-dialog-actions{margin-top:19px;display:flex;justify-content:flex-end;gap:7px}
      .cc-dialog-btn{height:35px;padding:0 12px;border:0;border-radius:9px;background:transparent;color:var(--text);font-size:12px;font-weight:500;cursor:pointer}
      .cc-dialog-btn:hover{background:var(--surface)}
      .cc-dialog-btn.danger{background:var(--danger);color:#fff}
      .cc-dialog-btn.danger:hover{filter:brightness(1.06)}

      @media(max-width:600px){
        #cclean-panel{right:8px;left:8px;bottom:62px;width:auto;height:min(620px,calc(100vh - 76px));border-radius:15px}
        #cclean-launcher{right:12px;bottom:12px}
        .cc-dropdown-trigger .cc-dd-label{max-width:92px}
        #cclean-project-trigger .cc-dd-label{max-width:118px}
        .cc-action span{display:none}.cc-action{width:34px;padding:0}
        .cc-selection small{display:none}
      }
    `;
    document.head.appendChild(style);
  }

  function detectDark() {
    if (document.documentElement.classList.contains('dark')) return true;
    try {
      const parts = getComputedStyle(document.body).backgroundColor.match(/\d+/g)?.map(Number);
      if (parts?.length >= 3) return (0.2126 * parts[0] + 0.7152 * parts[1] + 0.0722 * parts[2]) < 110;
    } catch {}
    return matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function syncTheme() {
    if (ui.root) ui.root.dataset.theme = detectDark() ? 'dark' : 'light';
  }

  function buildUI() {
    document.getElementById('cclean-root')?.remove();
    refreshLocale();

    const root = document.createElement('div');
    root.id = 'cclean-root';
    root.dir = localeKey === 'ar' ? 'rtl' : 'ltr';
    root.innerHTML = `
      <button id="cclean-launcher" title="${esc(t('manageChats'))}">
        ${ICONS.chats}<span data-i18n="launcherChats">${esc(t('launcherChats'))}</span><span id="cclean-badge">0</span>
      </button>

      <section id="cclean-panel" aria-label="${esc(t('manageConversations'))}">
        <div class="cc-head">
          <div class="cc-head-main">
            <div class="cc-title" data-i18n="manageChats">${esc(t('manageChats'))}</div>
            <div class="cc-sub"><span id="cclean-total">0</span> <span data-i18n="conversations">${esc(t('conversations'))}</span> · <span id="cclean-project-count">0</span> <span data-i18n="projects">${esc(t('projects'))}</span></div>
          </div>
          <button id="cclean-refresh" class="cc-icon" title="${esc(t('refresh'))}" aria-label="${esc(t('refresh'))}">${ICONS.refresh}</button>
          <button id="cclean-close" class="cc-icon" title="${esc(t('close'))}" aria-label="${esc(t('close'))}">${ICONS.close}</button>
        </div>

        <div class="cc-search-wrap">
          <div class="cc-search">${ICONS.search}<input id="cclean-search" placeholder="${esc(t('searchChats'))}" autocomplete="off"></div>
        </div>

        <div class="cc-tabs">
          <button class="cc-tab active" data-view="active"><span data-i18n="active">${esc(t('active'))}</span> <span class="cc-tab-count" id="cclean-active-count">0</span></button>
          <button class="cc-tab" data-view="archived"><span data-i18n="archives">${esc(t('archives'))}</span> <span class="cc-tab-count" id="cclean-archive-count">0</span></button>
          <button class="cc-tab" data-view="selected"><span data-i18n="selection">${esc(t('selection'))}</span> <span class="cc-tab-count" id="cclean-selected-tab">0</span></button>
        </div>

        <div class="cc-toolbar">
          <button class="cc-dropdown-trigger" id="cclean-scope-trigger" data-menu="scope">
            ${ICONS.filter}<span class="cc-dd-label" id="cclean-scope-label">${esc(t('scopeAll'))}</span><span class="cc-chev">${ICONS.chevron}</span>
          </button>
          <button class="cc-dropdown-trigger" id="cclean-project-trigger" data-menu="project">
            ${ICONS.folder}<span class="cc-dd-label" id="cclean-project-label">${esc(t('projectAll'))}</span><span class="cc-chev">${ICONS.chevron}</span>
          </button>
          <button class="cc-dropdown-trigger" id="cclean-sort-trigger" data-menu="sort" title="${esc(t('sortBy'))}">
            ${ICONS.sort}<span class="cc-dd-label" id="cclean-sort-label">${esc(t('sortRecent'))}</span><span class="cc-chev">${ICONS.chevron}</span>
          </button>
        </div>

        <div class="cc-list-head">
          <span class="cc-results" id="cclean-results">${esc(tp('resultsOne','resultsOther',0))}</span>
          <button id="cclean-select-visible" class="cc-selectall">${esc(t('selectAll'))}</button>
        </div>

        <div id="cclean-list"></div>

        <div class="cc-footer">
          <div class="cc-selection">
            <button id="cclean-clear-selection" class="cc-clear-selection" title="${esc(t('clearSelection'))}">${ICONS.close}</button>
            <div class="cc-selection-text">
              <strong id="cclean-selected-label">${esc(tp('selectedOne','selectedOther',0))}</strong>
              <small id="cclean-selection-meta">${esc(t('noPending'))}</small>
            </div>
          </div>
          <button id="cclean-archive" class="cc-action" title="${esc(t('archive'))}">${ICONS.archive}<span data-i18n="archive">${esc(t('archive'))}</span></button>
          <button id="cclean-restore" class="cc-action" title="${esc(t('restore'))}">${ICONS.restore}<span data-i18n="restore">${esc(t('restore'))}</span></button>
          <button id="cclean-delete" class="cc-action danger" title="${esc(t('delete'))}">${ICONS.trash}<span data-i18n="delete">${esc(t('delete'))}</span></button>
        </div>

        <div id="cclean-toast" class="cc-toast"></div>

        <div id="cclean-dialog-backdrop" class="cc-dialog-backdrop">
          <div class="cc-dialog" role="dialog" aria-modal="true" aria-labelledby="cclean-dialog-title">
            <h3 id="cclean-dialog-title">${esc(t('deleteTitle'))}</h3>
            <p id="cclean-dialog-text"></p>
            <div class="cc-dialog-actions">
              <button id="cclean-dialog-cancel" class="cc-dialog-btn">${esc(t('cancel'))}</button>
              <button id="cclean-dialog-confirm" class="cc-dialog-btn danger">${esc(t('delete'))}</button>
            </div>
          </div>
        </div>
      </section>

      <div id="cclean-menu" class="cc-menu"></div>
    `;
    document.body.appendChild(root);

    ui.root = root;
    ui.launcher = root.querySelector('#cclean-launcher');
    ui.badge = root.querySelector('#cclean-badge');
    ui.panel = root.querySelector('#cclean-panel');
    ui.refresh = root.querySelector('#cclean-refresh');
    ui.close = root.querySelector('#cclean-close');
    ui.search = root.querySelector('#cclean-search');
    ui.list = root.querySelector('#cclean-list');
    ui.total = root.querySelector('#cclean-total');
    ui.projectCount = root.querySelector('#cclean-project-count');
    ui.activeCount = root.querySelector('#cclean-active-count');
    ui.archiveCount = root.querySelector('#cclean-archive-count');
    ui.selectedTab = root.querySelector('#cclean-selected-tab');
    ui.scopeTrigger = root.querySelector('#cclean-scope-trigger');
    ui.scopeLabel = root.querySelector('#cclean-scope-label');
    ui.projectTrigger = root.querySelector('#cclean-project-trigger');
    ui.projectLabel = root.querySelector('#cclean-project-label');
    ui.sortTrigger = root.querySelector('#cclean-sort-trigger');
    ui.sortLabel = root.querySelector('#cclean-sort-label');
    ui.results = root.querySelector('#cclean-results');
    ui.selectVisible = root.querySelector('#cclean-select-visible');
    ui.selectedLabel = root.querySelector('#cclean-selected-label');
    ui.selectionMeta = root.querySelector('#cclean-selection-meta');
    ui.clearSelection = root.querySelector('#cclean-clear-selection');
    ui.archive = root.querySelector('#cclean-archive');
    ui.restore = root.querySelector('#cclean-restore');
    ui.delete = root.querySelector('#cclean-delete');
    ui.toast = root.querySelector('#cclean-toast');
    ui.menu = root.querySelector('#cclean-menu');
    ui.dialogBackdrop = root.querySelector('#cclean-dialog-backdrop');
    ui.dialogTitle = root.querySelector('#cclean-dialog-title');
    ui.dialogText = root.querySelector('#cclean-dialog-text');
    ui.dialogCancel = root.querySelector('#cclean-dialog-cancel');
    ui.dialogConfirm = root.querySelector('#cclean-dialog-confirm');

    bindUI();
    syncTheme();
    syncFilterLabels();
    updateCounters();
  }

  function applyLocaleToUI() {
    if (!ui.root) return;
    ui.root.dir = localeKey === 'ar' ? 'rtl' : 'ltr';
    const setText = (selector, key) => {
      const el = ui.root.querySelector(selector);
      if (el) el.textContent = t(key);
    };
    setText('[data-i18n="launcherChats"]', 'launcherChats');
    setText('[data-i18n="manageChats"]', 'manageChats');
    setText('[data-i18n="conversations"]', 'conversations');
    setText('[data-i18n="projects"]', 'projects');
    setText('[data-i18n="active"]', 'active');
    setText('[data-i18n="archives"]', 'archives');
    setText('[data-i18n="selection"]', 'selection');
    setText('[data-i18n="archive"]', 'archive');
    setText('[data-i18n="restore"]', 'restore');
    setText('[data-i18n="delete"]', 'delete');

    ui.launcher.title = t('manageChats');
    ui.panel.setAttribute('aria-label', t('manageConversations'));
    ui.refresh.title = ui.refresh.getAttribute('aria-label') = t('refresh');
    ui.close.title = ui.close.getAttribute('aria-label') = t('close');
    ui.search.placeholder = t('searchChats');
    ui.sortTrigger.title = t('sortBy');
    ui.clearSelection.title = t('clearSelection');
    ui.archive.title = t('archive');
    ui.restore.title = t('restore');
    ui.delete.title = t('delete');
    ui.dialogTitle.textContent = t('deleteTitle');
    ui.dialogCancel.textContent = t('cancel');
    ui.dialogConfirm.textContent = t('delete');

    syncFilterLabels();
    renderList();
  }

  function bindUI() {
    ui.launcher.onclick = event => {
      event.stopPropagation();
      closeMenu();
      ui.panel.classList.toggle('open');
      if (ui.panel.classList.contains('open')) setTimeout(() => ui.search.focus(), 40);
    };

    ui.close.onclick = () => {
      closeMenu();
      ui.panel.classList.remove('open');
    };

    ui.refresh.onclick = () => loadAll(true);

    ui.root.querySelectorAll('.cc-tab').forEach(button => {
      button.onclick = () => {
        state.view = button.dataset.view;
        renderLimit = CONFIG.RENDER_LIMIT;
        ui.root.querySelectorAll('.cc-tab').forEach(b => b.classList.toggle('active', b === button));
        renderList();
      };
    });

    ui.search.oninput = () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.query = ui.search.value.trim().toLocaleLowerCase(localeTag);
        renderLimit = CONFIG.RENDER_LIMIT;
        renderList();
      }, CONFIG.SEARCH_DELAY);
    };

    ui.root.querySelectorAll('[data-menu]').forEach(button => {
      button.onclick = event => {
        event.stopPropagation();
        toggleMenu(button.dataset.menu, button);
      };
    });

    ui.selectVisible.onclick = () => {
      const filtered = getFiltered();
      const allSelected = filtered.length > 0 && filtered.every(c => selectedIds.has(c.id));
      if (allSelected) filtered.forEach(c => selectedIds.delete(c.id));
      else filtered.forEach(c => selectedIds.add(c.id));
      renderList();
    };

    ui.clearSelection.onclick = () => {
      selectedIds.clear();
      renderList();
    };

    ui.archive.onclick = () => performMutation('archive');
    ui.restore.onclick = () => performMutation('restore');
    ui.delete.onclick = () => performMutation('delete');

    ui.list.onclick = event => {
      const more = event.target.closest('[data-more]');
      if (more) {
        renderLimit += CONFIG.RENDER_STEP;
        renderList();
        return;
      }

      const open = event.target.closest('[data-open]');
      if (open) {
        event.stopPropagation();
        window.open(`/c/${encodeURIComponent(open.dataset.open)}`, '_blank', 'noopener');
        return;
      }

      const row = event.target.closest('.cc-row');
      if (!row) return;
      const id = row.dataset.id;
      if (selectedIds.has(id)) selectedIds.delete(id); else selectedIds.add(id);

      if (state.view === 'selected') renderList();
      else {
        row.classList.toggle('selected', selectedIds.has(id));
        updateCounters();
        updateSelectAllLabel();
      }
    };

    ui.dialogCancel.onclick = closeDialog;
    ui.dialogBackdrop.onclick = event => { if (event.target === ui.dialogBackdrop) closeDialog(false); };

    document.addEventListener('pointerdown', event => {
      if (ui.menu.classList.contains('open') && !ui.menu.contains(event.target) && !event.target.closest('[data-menu]')) {
        closeMenu();
      }
      if (ui.panel.classList.contains('open') && !ui.panel.contains(event.target) && !ui.launcher.contains(event.target) && !ui.menu.contains(event.target)) {
        if (!ui.dialogBackdrop.classList.contains('open')) {
          closeMenu();
          ui.panel.classList.remove('open');
        }
      }
    }, true);

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        if (ui.dialogBackdrop.classList.contains('open')) { closeDialog(false); return; }
        if (ui.menu.classList.contains('open')) { closeMenu(); return; }
        ui.panel.classList.remove('open');
      }
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'x') {
        event.preventDefault();
        closeMenu();
        ui.panel.classList.toggle('open');
      }
    });

    window.addEventListener('resize', closeMenu, { passive: true });
    window.addEventListener('scroll', closeMenu, { passive: true, capture: true });

    new MutationObserver(mutations => {
      syncTheme();
      if (mutations.some(m => m.attributeName === 'lang') && refreshLocale()) {
        applyLocaleToUI();
      }
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'lang'],
    });
  }

  function syncFilterLabels() {
    const scopeLabels = {
      all: t('scopeAll'),
      projects: t('scopeProjects'),
      outside: t('scopeOutside'),
    };
    const sortLabels = {
      updated_desc: t('sortRecent'),
      updated_asc: t('sortOld'),
      title_asc: t('sortAZ'),
      project_asc: t('sortProject'),
    };

    ui.scopeLabel.textContent = scopeLabels[state.scope] || t('scopeAll');
    ui.sortLabel.textContent = sortLabels[state.sort] || t('sortRecent');

    const project = projects.find(p => p.id === state.projectId);
    ui.projectLabel.textContent = project?.name || t('projectAll');
    ui.projectTrigger.classList.toggle('disabled', state.scope === 'outside');
  }

  function toggleMenu(type, trigger) {
    if (openMenuType === type && ui.menu.classList.contains('open')) {
      closeMenu();
      return;
    }
    closeMenu();
    openMenuType = type;
    renderMenu(type);
    positionMenu(trigger);
    ui.menu.classList.add('open');
    trigger.classList.add('active');

    const projectSearch = ui.menu.querySelector('#cclean-project-search');
    if (projectSearch) setTimeout(() => projectSearch.focus(), 20);
  }

  function closeMenu() {
    ui.menu?.classList.remove('open');
    ui.root?.querySelectorAll('.cc-dropdown-trigger.active').forEach(el => el.classList.remove('active'));
    openMenuType = null;
  }

  function positionMenu(trigger) {
    const rect = trigger.getBoundingClientRect();
    const width = openMenuType === 'project' ? 250 : 210;
    ui.menu.style.width = `${width}px`;
    ui.menu.style.maxWidth = `${Math.min(width, window.innerWidth - 16)}px`;
    const menuWidth = Math.min(width, window.innerWidth - 16);
    let left = rect.left;
    if (left + menuWidth > window.innerWidth - 8) left = window.innerWidth - menuWidth - 8;
    if (left < 8) left = 8;
    ui.menu.style.left = `${left}px`;
    ui.menu.style.top = `${Math.min(rect.bottom + 5, window.innerHeight - 340)}px`;
  }

  function renderMenu(type) {
    if (type === 'scope') {
      const options = [
        ['all', t('scopeAll'), ICONS.chats],
        ['projects', t('scopeProjects'), ICONS.folder],
        ['outside', t('scopeOutside'), ICONS.chats],
      ];
      ui.menu.innerHTML = `<div class="cc-menu-label">${esc(t('show'))}</div><div class="cc-menu-list">${options.map(([value, label, icon]) => menuItem(value, label, icon, state.scope === value)).join('')}</div>`;
      ui.menu.onclick = event => {
        const item = event.target.closest('[data-value]');
        if (!item) return;
        state.scope = item.dataset.value;
        if (state.scope === 'outside') state.projectId = 'all';
        syncFilterLabels();
        closeMenu();
        renderLimit = CONFIG.RENDER_LIMIT;
        renderList();
      };
      return;
    }

    if (type === 'sort') {
      const options = [
        ['updated_desc', t('sortRecent')],
        ['updated_asc', t('sortOld')],
        ['title_asc', t('sortAZ')],
        ['project_asc', t('sortProject')],
      ];
      ui.menu.innerHTML = `<div class="cc-menu-label">${esc(t('sortBy'))}</div><div class="cc-menu-list">${options.map(([value, label]) => menuItem(value, label, ICONS.sort, state.sort === value)).join('')}</div>`;
      ui.menu.onclick = event => {
        const item = event.target.closest('[data-value]');
        if (!item) return;
        state.sort = item.dataset.value;
        syncFilterLabels();
        closeMenu();
        renderLimit = CONFIG.RENDER_LIMIT;
        renderList();
      };
      return;
    }

    if (type === 'project') {
      renderProjectMenu('');
    }
  }

  function menuItem(value, label, icon, selected) {
    return `<button class="cc-menu-item${selected ? ' selected' : ''}" data-value="${esc(value)}"><span class="cc-mi-icon">${icon}</span><span class="cc-mi-main">${esc(label)}</span><span class="cc-mi-check">${ICONS.check}</span></button>`;
  }

  function renderProjectMenu(filterText) {
    const q = String(filterText || '').trim().toLocaleLowerCase(localeTag);
    const filtered = q ? projects.filter(p => p.name.toLocaleLowerCase(localeTag).includes(q)) : projects;

    ui.menu.innerHTML = `
      <div class="cc-menu-search"><div class="cc-menu-searchbox">${ICONS.search}<input id="cclean-project-search" placeholder="${esc(t('searchProject'))}" value="${esc(filterText || '')}"></div></div>
      <div class="cc-menu-list" id="cclean-project-list">
        ${menuItem('all', t('projectAll'), ICONS.folder, state.projectId === 'all')}
        <div class="cc-menu-sep"></div>
        ${filtered.length ? filtered.map(project => menuItem(project.id, project.name, ICONS.folder, state.projectId === project.id)).join('') : `<div class="cc-menu-empty">${esc(t('noProjectFound'))}</div>`}
      </div>`;

    const input = ui.menu.querySelector('#cclean-project-search');
    input.oninput = () => {
      const caret = input.selectionStart;
      renderProjectMenu(input.value);
      const next = ui.menu.querySelector('#cclean-project-search');
      next.focus();
      try { next.setSelectionRange(caret, caret); } catch {}
    };

    ui.menu.onclick = event => {
      const item = event.target.closest('[data-value]');
      if (!item) return;
      state.projectId = item.dataset.value;
      if (state.projectId !== 'all') state.scope = 'projects';
      syncFilterLabels();
      closeMenu();
      renderLimit = CONFIG.RENDER_LIMIT;
      renderList();
    };
  }

  function setToast(message = '', isLoading = false, timeout = 0) {
    if (!ui.toast) return;
    ui.toast.textContent = message;
    ui.toast.classList.toggle('loading', Boolean(message && isLoading));
    ui.toast.classList.toggle('on', Boolean(message));
    clearTimeout(ui.toast._timer);
    if (message && timeout > 0) {
      ui.toast._timer = setTimeout(() => setToast(''), timeout);
    }
  }

  function getFiltered() {
    const filtered = conversations.filter(c => {
      if (state.view === 'active' && c.is_archived) return false;
      if (state.view === 'archived' && !c.is_archived) return false;
      if (state.view === 'selected' && !selectedIds.has(c.id)) return false;

      const inProject = isProjectConversation(c);
      if (state.scope === 'projects' && !inProject) return false;
      if (state.scope === 'outside' && inProject) return false;
      if (state.projectId !== 'all' && c.gizmo_id !== state.projectId) return false;

      if (state.query) {
        const haystack = `${c.title || ''} ${projectNameFor(c) || ''}`.toLocaleLowerCase(localeTag);
        if (!haystack.includes(state.query)) return false;
      }
      return true;
    });

    const sorted = filtered.slice();
    if (state.sort === 'updated_asc') sorted.sort((a, b) => timeValue(a.update_time) - timeValue(b.update_time));
    else if (state.sort === 'title_asc') sorted.sort((a, b) => (a.title || '').localeCompare(b.title || '', localeTag, { sensitivity: 'base' }));
    else if (state.sort === 'project_asc') sorted.sort((a, b) => {
      const ap = projectNameFor(a) || `~~~~ ${t('outsideProject')}`;
      const bp = projectNameFor(b) || `~~~~ ${t('outsideProject')}`;
      return ap.localeCompare(bp, localeTag, { sensitivity: 'base' }) || timeValue(b.update_time) - timeValue(a.update_time);
    });
    else sorted.sort((a, b) => timeValue(b.update_time) - timeValue(a.update_time));
    return sorted;
  }

  function renderList() {
    if (!ui.list) return;
    const filtered = getFiltered();
    ui.results.textContent = tp('resultsOne', 'resultsOther', filtered.length);

    if (!filtered.length) {
      ui.list.innerHTML = `<div class="cc-empty"><strong>${esc(state.view === 'selected' ? t('noSelected') : t('noConversation'))}</strong><span>${esc(state.query ? t('trySearch') : t('adjustFilters'))}</span></div>`;
      updateCounters();
      updateSelectAllLabel();
      return;
    }

    const slice = filtered.slice(0, renderLimit);
    ui.list.innerHTML = slice.map(c => {
      const selected = selectedIds.has(c.id);
      const project = projectNameFor(c);
      const secondary = c.is_archived ? t('archived') : formatDate(c.update_time);
      const title = c.title || t('untitled');
      return `
        <div class="cc-row${selected ? ' selected' : ''}" data-id="${esc(c.id)}">
          <div class="cc-check" aria-hidden="true">${ICONS.check}</div>
          <div class="cc-row-main">
            <div class="cc-row-title" title="${esc(title)}">${esc(title)}</div>
            <div class="cc-row-meta">
              <span class="cc-project">${project ? `${ICONS.folder}${esc(project)}` : esc(t('outsideProject'))}</span>
              <span class="cc-dot">·</span><span>${esc(secondary)}</span>
            </div>
          </div>
          <button class="cc-open" data-open="${esc(c.id)}" title="${esc(t('open'))}" aria-label="${esc(t('openConversation'))}">${ICONS.external}</button>
        </div>`;
    }).join('') + (slice.length < filtered.length
      ? `<button class="cc-more" data-more="1">${esc(t('showMore', { count: Math.min(CONFIG.RENDER_STEP, filtered.length - slice.length) }))}</button>`
      : '');

    updateCounters();
    updateSelectAllLabel();
  }

  function updateSelectAllLabel() {
    const filtered = getFiltered();
    const allSelected = filtered.length > 0 && filtered.every(c => selectedIds.has(c.id));
    ui.selectVisible.textContent = allSelected ? t('deselectAll') : t('selectAll');
  }

  function selectedConversations() {
    const map = new Map(conversations.map(c => [c.id, c]));
    return [...selectedIds].map(id => map.get(id)).filter(Boolean);
  }

  function updateCounters() {
    if (!ui.total) return;
    const active = conversations.filter(c => !c.is_archived).length;
    const archived = conversations.filter(c => c.is_archived).length;
    const selected = selectedConversations();
    const selectedActive = selected.filter(c => !c.is_archived).length;
    const selectedArchived = selected.filter(c => c.is_archived).length;

    ui.total.textContent = conversations.length;
    ui.projectCount.textContent = projects.length;
    ui.activeCount.textContent = active;
    ui.archiveCount.textContent = archived;
    ui.selectedTab.textContent = selected.length;
    ui.selectedLabel.textContent = tp('selectedOne', 'selectedOther', selected.length);

    if (!selected.length) ui.selectionMeta.textContent = t('noPending');
    else if (selectedActive && selectedArchived) ui.selectionMeta.textContent = t('selectedMixed', { active: selectedActive, archived: selectedArchived });
    else if (selectedActive) ui.selectionMeta.textContent = t('selectedActive', { count: selectedActive });
    else ui.selectionMeta.textContent = t('selectedArchived', { count: selectedArchived });

    ui.clearSelection.classList.toggle('on', selected.length > 0);
    ui.archive.classList.toggle('on', !mutating && selectedActive > 0);
    ui.restore.classList.toggle('on', !mutating && selectedArchived > 0);
    ui.delete.classList.toggle('on', !mutating && selected.length > 0);

    ui.badge.textContent = selected.length;
    ui.badge.classList.toggle('on', selected.length > 0);
  }

  function confirmDelete(count) {
    return new Promise(resolve => {
      ui.dialogText.textContent = tp('deleteConfirmOne', 'deleteConfirmOther', count);
      ui.dialogBackdrop.classList.add('open');
      ui.dialogConfirm.focus();

      const finish = value => {
        ui.dialogConfirm.onclick = null;
        ui.dialogCancel.onclick = null;
        ui.dialogBackdrop.classList.remove('open');
        resolve(value);
      };

      ui.dialogConfirm.onclick = () => finish(true);
      ui.dialogCancel.onclick = () => finish(false);
      ui.dialogBackdrop._finish = finish;
    });
  }

  function closeDialog(value = false) {
    if (!ui.dialogBackdrop?.classList.contains('open')) return;
    if (typeof ui.dialogBackdrop._finish === 'function') {
      const finish = ui.dialogBackdrop._finish;
      ui.dialogBackdrop._finish = null;
      finish(value);
    } else {
      ui.dialogBackdrop.classList.remove('open');
    }
  }

  async function performMutation(action) {
    if (mutating) return;

    const allSelected = selectedConversations();
    let targets = allSelected;
    let payload;
    let verb;

    if (action === 'archive') {
      targets = allSelected.filter(c => !c.is_archived);
      payload = { is_archived: true };
      verb = t('archiving');
    } else if (action === 'restore') {
      targets = allSelected.filter(c => c.is_archived);
      payload = { is_archived: false };
      verb = t('restoring');
    } else {
      payload = { is_visible: false };
      verb = t('deleting');
      if (!targets.length || !(await confirmDelete(targets.length))) return;
    }

    if (!targets.length) return;

    mutating = true;
    closeMenu();
    updateCounters();
    let done = 0;
    let failed = 0;
    const succeeded = new Set();

    for (let i = 0; i < targets.length; i++) {
      const c = targets[i];
      setToast(`${verb} ${i + 1}/${targets.length}…`, true);
      const ok = await patchWithRetry(c.id, payload);
      if (ok) {
        done++;
        succeeded.add(c.id);
        if (action === 'archive') c.is_archived = true;
        else if (action === 'restore') c.is_archived = false;
      } else {
        failed++;
      }
      if (i < targets.length - 1) await sleep(CONFIG.MUTATION_DELAY);
    }

    if (action === 'delete') conversations = conversations.filter(c => !succeeded.has(c.id));
    for (const id of succeeded) selectedIds.delete(id);

    mutating = false;
    renderList();
    const doneLabel = action === 'archive' ? t('doneArchived') : action === 'restore' ? t('doneRestored') : t('doneDeleted');
    const failureLabel = failed ? ` · ${tp('failureOne', 'failureOther', failed)}` : '';
    setToast(`${done} ${doneLabel}${failureLabel}`, false, 3200);
  }

  async function loadAll(forceToken = false) {
    if (loading) return;
    loading = true;
    const generation = ++loadGeneration;
    ui.refresh.disabled = true;
    ui.refresh.classList.add('loading');
    setToast(t('loadingConversations'), true);

    try {
      if (!accessToken || forceToken) accessToken = await getAccessToken();

      const [active, archived, projectListResult] = await Promise.all([
        fetchConversationPass(false),
        fetchConversationPass(true),
        fetchProjects().catch(error => {
          console.warn('[ChatGPT Cleaner] Projects unavailable:', error);
          return [];
        }),
      ]);

      if (generation !== loadGeneration) return;
      projects = projectListResult;

      let projectChats = [];
      if (projects.length) projectChats = await fetchAllProjectConversations(projects, generation);
      if (generation !== loadGeneration) return;

      conversations = mergeConversationSources(active, archived, projectChats);
      const projectMap = new Map(projects.map(p => [p.id, p.name]));
      conversations = conversations.map(c => ({
        ...c,
        project_name: c.project_name || projectMap.get(c.gizmo_id) || undefined,
      }));

      const existing = new Set(conversations.map(c => c.id));
      for (const id of [...selectedIds]) if (!existing.has(id)) selectedIds.delete(id);

      if (state.projectId !== 'all' && !projects.some(p => p.id === state.projectId)) state.projectId = 'all';
      syncFilterLabels();
      renderLimit = CONFIG.RENDER_LIMIT;
      renderList();
      setToast(t('upToDate'), false, 1200);
    } catch (error) {
      console.error('[ChatGPT Cleaner]', error);
      setToast(`${t('error')} : ${error.message}`, false, 5000);
    } finally {
      if (generation === loadGeneration) {
        loading = false;
        ui.refresh.disabled = false;
        ui.refresh.classList.remove('loading');
        updateCounters();
      }
    }
  }

  async function init() {
    injectStyles();
    buildUI();
    await loadAll(false);
  }

  init();
})();
