(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__d55ec937._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/apps/web/messages/en.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"common":{"hypothesisCenter":"Hypothesis Management Center","newHypothesis":"New Hypothesis","recordDecision":"Record Decision","searchPlaceholder":"Search hypotheses, owners, or audit logs… (⌘K)","searchAriaLabel":"Command search","days":"d","hours":"h","impact":"Impact","feasibility":"Feasibility","due":"Due"},"header":{"title":"Operationalize every AI hypothesis from a single command center.","description":"Track intake, approvals, and ROI, orchestrating workflows that turn ideas into production-ready AI assets.","quickLinks":{"decisionLog":"Decision Log","experimentQueue":"Experiment Queue","governanceTasks":"Governance Tasks"}},"hypotheses":{"snapshot":{"portfolioValue":"Portfolio Value","experimentsInFlight":"Experiments in Flight","avgTimeToValue":"Avg Time to Value","governancePending":"Governance Pending"},"kanban":{"title":"Lifecycle Operations","subtitle":"Track velocity at each stage.","description":"SLAs, conversion, and ownership rolled up across the six-stage hypothesis journey.","activeHypotheses":"{count} active hypotheses","averageDays":"Avg Days","conversion":"Conversion","sla":"SLA","health":{"onTrack":"On Track","warning":"Warning","risk":"Risk"},"noHypotheses":"No hypotheses at this stage","nextGate":"Next Gate"},"detail":{"sponsor":"Sponsor","governanceBrief":"Governance Brief","impactScore":"Impact Score","feasibility":"Feasibility","confidence":"Confidence","targetValue":"Target Value","nextMilestone":"Next Milestone","nextMilestoneDescription":"Align experiment results and governance evidence before requesting advancement.","linkedExperiments":"Linked Experiments","gatingChecklist":"Gating Checklist","dependencies":"Dependencies"},"matrix":{"title":"Prioritization Grid","subtitle":"Impact vs. Feasibility.","displayedInitiatives":"{count} displayed initiatives","quadrants":{"pursue":{"label":"Pursue","description":"High impact + high feasibility. Immediately push to experiment backlog."},"partner":{"label":"Partner","description":"Influential but constrained. Engage data engineering or management support."},"optimize":{"label":"Optimize","description":"Operational wins with minimal effort. Keep lightweight and iterate quickly."},"observe":{"label":"Observe","description":"Track signals, gather data, and reassess in the next cycle."}},"noHypotheses":"No hypotheses in this quadrant","more":"+{count} more"},"ops":{"title":"Priority Actions","subtitle":"Resolve blockers before they stall velocity.","critical":"{count} critical","status":{"atRisk":"At Risk","dueSoon":"Due Soon","blocked":"Blocked"}},"activity":{"title":"Decision Log","subtitle":"Every action logged for audit and replay.","impact":{"positive":"Positive","neutral":"Neutral","negative":"Negative"},"recordedBy":"Recorded by {actor}"}},"navigation":{"overview":"Overview","hypotheses":"Hypotheses","experiments":"Experiments","value":"Value & ROI","people":"People","governance":"Governance","resources":"Resources","labs":"Labs","dashboards":"Dashboards","notifications":"Notifications","files":"Files","admin":"Administration","analytics":"Analytics","workflows":"Workflows","descriptions":{"overview":"Portfolio pulse with KPIs, alerts, and cross-domain queues.","hypotheses":"Kanban, scoring, and transitions tied to lifecycle stages.","experiments":"Runs, metrics, and artifacts linked to source hypothesis.","value":"Structured value cases and ROI calculators for hypothesis inputs.","people":"Roles, access policies, and approvals aligned with governance stages.","governance":"Risks, approvals, and policy knowledge base with workflow hooks.","resources":"GPU and compute orchestration matched to experiment demand.","labs":"Workspaces, membership, and visibility controls by portfolio.","dashboards":"Executive, portfolio, and team dashboards with hypothesis metrics.","notifications":"Stage, task, and SLA threat signals with context.","files":"Versioned artifacts and evidence tied to hypotheses and experiments.","admin":"Dictionaries, integrations, and workflow templates.","analytics":"Time series, bottleneck insights, and predictive signals.","workflows":"BPMN-style designer for hypothesis stages and task automation."}}});}),
"[project]/apps/web/messages/ru.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"common":{"hypothesisCenter":"Центр управления гипотезами","newHypothesis":"Новая гипотеза","recordDecision":"Записать решение","searchPlaceholder":"Поиск гипотез, владельцев или аудит-логов… (⌘K)","searchAriaLabel":"Командный поиск","days":"д","hours":"ч","impact":"Влияние","feasibility":"Выполнимость","due":"Срок"},"header":{"title":"Операционализируйте каждую гипотезу ИИ из единого командного центра.","description":"Отслеживайте прием, утверждения и ROI, оркестрируя рабочие процессы, превращающие идеи в готовые к продакшену ИИ-активы.","quickLinks":{"decisionLog":"Журнал решений","experimentQueue":"Очередь экспериментов","governanceTasks":"Задачи управления"}},"hypotheses":{"snapshot":{"portfolioValue":"Стоимость портфеля","experimentsInFlight":"Экспериментов в работе","avgTimeToValue":"Ср. время до результата","governancePending":"Ожидает управления"},"kanban":{"title":"Операции жизненного цикла","subtitle":"Отслеживайте скорость на каждом этапе.","description":"SLA, конверсия и владение сведены по шестиэтапному пути гипотез.","activeHypotheses":"{count} активных гипотез","averageDays":"Ср. дней","conversion":"Конверсия","sla":"SLA","health":{"onTrack":"В норме","warning":"Предупреждение","risk":"Риск"},"noHypotheses":"Нет гипотез на этом этапе","nextGate":"Следующий этап"},"detail":{"sponsor":"Спонсор","governanceBrief":"Бриф по управлению","impactScore":"Оценка влияния","feasibility":"Выполнимость","confidence":"Уверенность","targetValue":"Целевая стоимость","nextMilestone":"Следующий этап","nextMilestoneDescription":"Согласуйте результаты экспериментов и доказательства управления перед запросом продвижения.","linkedExperiments":"Связанные эксперименты","gatingChecklist":"Чеклист для продвижения","dependencies":"Зависимости"},"matrix":{"title":"Сетка приоритизации","subtitle":"Влияние vs выполнимость.","displayedInitiatives":"{count} отображенных инициатив","quadrants":{"pursue":{"label":"Внедрять","description":"Высокое влияние + высокая выполнимость. Немедленно продвигать в бэклог экспериментов."},"partner":{"label":"Совместная разработка","description":"Влиятельный, но ограниченный. Привлечь поддержку data engineering или управления."},"optimize":{"label":"Оптимизировать","description":"Операционные победы с минимальными усилиями. Держать легковесным и итерировать быстро."},"observe":{"label":"Наблюдать","description":"Отслеживать сигналы, собирать данные и переоценивать в следующем цикле."}},"noHypotheses":"Нет гипотез в этом квадранте","more":"+{count} еще"},"ops":{"title":"Приоритетные действия","subtitle":"Устраняйте блокеры до того, как они остановят скорость.","critical":"{count} критических","status":{"atRisk":"В зоне риска","dueSoon":"Скоро срок","blocked":"Заблокировано"}},"activity":{"title":"Журнал решений","subtitle":"Каждое действие зафиксировано для аудита и воспроизведения.","impact":{"positive":"Позитивно","neutral":"Нейтрально","negative":"Негативно"},"recordedBy":"Записано {actor}"}},"navigation":{"overview":"Обзор","hypotheses":"Гипотезы","experiments":"Эксперименты","value":"Ценность и ROI","people":"Люди","governance":"Управление","resources":"Ресурсы","labs":"Лаборатории","dashboards":"Дашборды","notifications":"Уведомления","files":"Файлы","admin":"Администрирование","analytics":"Аналитика","workflows":"Рабочие процессы","descriptions":{"overview":"Пульс портфеля с KPI, предупреждениями и междоменными очередями.","hypotheses":"Канбан, оценка и переходы, привязанные к этапам жизненного цикла.","experiments":"Запуски, метрики и артефакты, связанные с исходной гипотезой.","value":"Структурированные кейсы ценности и калькуляторы ROI для входных данных гипотез.","people":"Роли, политики доступа и утверждения, согласованные с этапами управления.","governance":"Риски, утверждения и база знаний политик с хуками рабочих процессов.","resources":"Оркестрация GPU и вычислений, сопоставленная со спросом на эксперименты.","labs":"Рабочие пространства, членство и контроль видимости по портфелю.","dashboards":"Исполнительные, портфельные и командные дашборды с метриками гипотез.","notifications":"Сигналы об этапах, задачах и угрозах SLA с контекстом.","files":"Версионированные артефакты и доказательства, привязанные к гипотезам и экспериментам.","admin":"Словари, интеграции и шаблоны рабочих процессов.","analytics":"Временные ряды, инсайты о узких местах и предиктивные сигналы.","workflows":"Конструктор в стиле BPMN для этапов гипотез и автоматизации задач."}}});}),
"[project]/apps/web/i18n.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "locales",
    ()=>locales
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$intl$40$4$2e$4$2e$0_next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$_c2efd69d64dc8ff914a47db05e67ae8c$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getRequestConfig$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__getRequestConfig$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next-intl@4.4.0_next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19._c2efd69d64dc8ff914a47db05e67ae8c/node_modules/next-intl/dist/esm/development/server/react-server/getRequestConfig.js [middleware-edge] (ecmascript) <export default as getRequestConfig>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$messages$2f$en$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/apps/web/messages/en.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$messages$2f$ru$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/apps/web/messages/ru.json (json)");
;
;
;
const locales = [
    'en',
    'ru'
];
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$intl$40$4$2e$4$2e$0_next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$_c2efd69d64dc8ff914a47db05e67ae8c$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getRequestConfig$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$export__default__as__getRequestConfig$3e$__["getRequestConfig"])(async ({ locale })=>{
    // Fallback to 'en' if locale is not supported
    const validLocale = locales.includes(locale) ? locale : 'en';
    let messages;
    if (validLocale === 'ru') {
        messages = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$messages$2f$ru$2e$json__$28$json$29$__["default"];
    } else {
        messages = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$messages$2f$en$2e$json__$28$json$29$__["default"]; // Default to English
    }
    return {
        locale: validLocale,
        messages
    };
});
}),
"[project]/apps/web/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$intl$40$4$2e$4$2e$0_next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$_c2efd69d64dc8ff914a47db05e67ae8c$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$middleware$2f$middleware$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next-intl@4.4.0_next@16.0.1_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19._c2efd69d64dc8ff914a47db05e67ae8c/node_modules/next-intl/dist/esm/development/middleware/middleware.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$i18n$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/i18n.ts [middleware-edge] (ecmascript)");
;
;
;
const intlMiddleware = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$2d$intl$40$4$2e$4$2e$0_next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$_c2efd69d64dc8ff914a47db05e67ae8c$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$middleware$2f$middleware$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"])({
    locales: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$i18n$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["locales"],
    defaultLocale: 'en',
    localePrefix: 'never',
    localeDetection: false
});
function middleware(request) {
    // Don't interfere with the request, just add locale info
    const response = intlMiddleware(request);
    // Ensure we don't redirect or modify paths
    if (response && response.headers.get('x-middleware-rewrite')) {
        return response;
    }
    return response || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$0$2e$1_$40$babel$2b$core$40$7$2e$28$2e$5_react$2d$dom$40$19$2e$2$2e$0_react$40$19$2e$2$2e$0_$5f$react$40$19$2e$2$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        '/((?!_next|api|favicon.ico|.*\\..*).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__d55ec937._.js.map