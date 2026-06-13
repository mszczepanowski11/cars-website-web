-- ============================================================
-- CARIZO – Comprehensive seed v3
-- Safe to run multiple times (INSERT IGNORE)
-- Tables: CarColors, FeatureCategories, Features
-- ============================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================
-- 1. COLORS – extensive variants (ids 50–130)
-- ============================================================

INSERT IGNORE INTO `CarColors` (`id`, `name`, `hexCode`) VALUES
-- ── Black family
(50, 'Czarny połysk',         '#050505'),
(51, 'Czarny mat',            '#1C1C1C'),
(52, 'Czarny metalik',        '#161B22'),
(53, 'Czarny perłowy',        '#0D0D1A'),
(54, 'Czarny satynowy',       '#111111'),

-- ── White family
(55, 'Biały połysk',          '#FAFAFA'),
(56, 'Biały perłowy',         '#F5F0EA'),
(57, 'Biały metalik',         '#E8E8E8'),
(58, 'Biały mat',             '#F2F2F2'),
(59, 'Biały kości słoniowej', '#FFFFF0'),

-- ── Silver / Gray family
(60, 'Srebrny metalik',       '#C0C0C0'),
(61, 'Srebrny połysk',        '#D8D8D8'),
(62, 'Grafitowy',             '#404040'),
(63, 'Grafitowy metalik',     '#4A4A4A'),
(64, 'Antracytowy',           '#2D2D2D'),
(65, 'Antracytowy metalik',   '#363636'),
(66, 'Szary jasny',           '#A0A0A0'),
(67, 'Szary mat',             '#888888'),
(68, 'Szary perłowy',         '#9A9A9A'),
(69, 'Szary kwarcowy',        '#787878'),

-- ── Red / Burgundy family
(70, 'Czerwony głęboki',      '#CC0000'),
(71, 'Czerwony metalik',      '#B71C1C'),
(72, 'Czerwony połysk',       '#E01010'),
(73, 'Bordowy',               '#7B1F1F'),
(74, 'Bordowy metalik',       '#6B1B1B'),
(75, 'Wiśniowy',              '#8E1A1A'),
(76, 'Karminowy',             '#960018'),
(77, 'Malinowy metalik',      '#C2185B'),

-- ── Blue / Navy family
(78, 'Niebieski metalik',     '#1A5276'),
(79, 'Niebieski połysk',      '#2471A3'),
(80, 'Granatowy',             '#1B2A4A'),
(81, 'Granatowy metalik',     '#0D1B3E'),
(82, 'Niebieski jasny metalik','#2980B9'),
(83, 'Niebieski szafirowy',   '#0C3547'),
(84, 'Lazurowy',              '#00B4D8'),
(85, 'Petrol (niebieskozielony)', '#1B6B5B'),
(86, 'Niebieski elektryczny', '#0033CC'),
(87, 'Kobaltowy',             '#002FA7'),

-- ── Green family
(88, 'Zielony metalik',       '#1B5E20'),
(89, 'Butelkowa zieleń',      '#006A4E'),
(90, 'Khaki',                 '#7D7C4F'),
(91, 'Oliwkowy',              '#6B8E23'),
(92, 'Miętowy metalik',       '#3EB489'),
(93, 'Ciemnozielony',         '#1B4332'),
(94, 'Leśna zieleń',          '#2D6A4F'),

-- ── Brown / Beige / Gold family
(95, 'Brązowy metalik',       '#6D4C41'),
(96, 'Brązowy połysk',        '#795548'),
(97, 'Beżowy',                '#D2B48C'),
(98, 'Cappuccino',            '#C19A6B'),
(99, 'Złoty metalik',         '#D4AC0D'),
(100,'Champagne perłowy',     '#F7E7CE'),
(101,'Miedziany metalik',     '#B87333'),
(102,'Caramel',               '#C68642'),
(103,'Piaskowy',              '#DEB887'),

-- ── Orange / Yellow family
(104,'Pomarańczowy metalik',  '#E65100'),
(105,'Pomarańczowy perłowy',  '#FF6D00'),
(106,'Żółty połysk',          '#FFC107'),
(107,'Żółty metalik',         '#F9A825'),
(108,'Żółty perłowy',         '#FFD700'),
(109,'Piaskowy żółty',        '#D4A017'),

-- ── Purple / Pink family
(110,'Fioletowy metalik',     '#6A1B9A'),
(111,'Fioletowy połysk',      '#7B1FA2'),
(112,'Śliwkowy metalik',      '#4A0C7A'),
(113,'Różowy metalik',        '#C2185B'),
(114,'Różowe złoto metalik',  '#B76E79'),
(115,'Mauve (pudrowy różowy)','#E8C0C8'),

-- ── Special / Multi
(116,'Dwukolorowy biały/czarny',   '#C8C8C8'),
(117,'Chromowany / lustrzany',      '#C9C0BB'),
(118,'Kamuflaż wojskowy',           '#6B7B3A'),
(119,'Matowy custom',               '#3A3A3A'),
(120,'Inny / niestandardowy',       '#808080');

-- ============================================================
-- 2. FEATURE CATEGORIES – ensure all vehicle types covered
-- ============================================================

INSERT IGNORE INTO `FeatureCategories` (`id`, `name`) VALUES
-- Standard car categories (1–8 assumed to exist from initial seed)
(1,  'Multimedia i łączność'),
(2,  'Bezpieczeństwo'),
(3,  'Komfort'),
(4,  'Systemy wspomagania'),
(5,  'Oświetlenie'),
(6,  'Wnętrze i tapicerka'),
(7,  'Zewnętrzne i akcesoria'),
(8,  'Napęd i układ jezdny'),
-- Special vehicle categories
(9,  'Specjalne – Ciężarówki'),
(10, 'Specjalne – Motocykle'),
(11, 'Specjalne – Dostawcze'),
(12, 'Specjalne – Przyczepy i naczepy'),
(13, 'Specjalne – Maszyny budowlane'),
(14, 'Specjalne – Maszyny rolnicze');

-- ============================================================
-- 3. FEATURES – comprehensive per-category lists
-- ============================================================

-- ── 3a. Multimedia i łączność (cat 1) ─────────────────────

INSERT IGNORE INTO `Features` (`id`, `name`, `CategoryId`) VALUES
(101, 'Android Auto',                    1),
(102, 'Apple CarPlay',                   1),
(103, 'Bluetooth',                       1),
(104, 'USB-A',                           1),
(105, 'USB-C',                           1),
(106, 'Nawigacja satelitarna (wbudowana)',1),
(107, 'Ekran dotykowy',                  1),
(108, 'Wyświetlacz head-up (HUD)',        1),
(109, 'Wi-Fi hotspot',                   1),
(110, 'Bezprzewodowe ładowanie (Qi)',     1),
(111, 'Premium Audio (JBL / Harman / B&O)',1),
(112, 'Cyfrowe radio (DAB+)',             1),
(113, 'Siri / Asystent głosowy',         1),
(114, 'Kamera wideo (dash cam wbudowana)',1),
(115, 'System nagłośnienia 3D',           1);

-- ── 3b. Bezpieczeństwo (cat 2) ────────────────────────────

INSERT IGNORE INTO `Features` (`id`, `name`, `CategoryId`) VALUES
(201, 'ABS',                                          2),
(202, 'ESP / ESC (kontrola trakcji)',                  2),
(203, 'ASR (zapobieganie poślizgowi kół)',             2),
(204, 'EBD (elektroniczny rozdział siły hamowania)',   2),
(205, 'Hamulce ceramiczne',                            2),
(206, 'Kamera cofania',                                2),
(207, 'Kamera 360°',                                   2),
(208, 'Czujniki parkowania tylne',                     2),
(209, 'Czujniki parkowania przednie',                  2),
(210, 'Asystent pasa ruchu (LKA)',                     2),
(211, 'Asystent martwego pola (BSD)',                  2),
(212, 'Autonomiczne hamowanie awaryjne (AEB)',          2),
(213, 'Tempomat adaptacyjny (ACC)',                    2),
(214, 'Monitorowanie zmęczenia kierowcy',              2),
(215, 'Monitorowanie ciśnienia w oponach (TPMS)',      2),
(216, 'System nocnej jazdy (Night Vision)',            2),
(217, 'Asystent ruszania pod górę (HSA)',              2),
(218, 'Poduszka powietrzna kierowcy',                  2),
(219, 'Poduszka powietrzna pasażera',                  2),
(220, 'Boczne poduszki powietrzne',                   2),
(221, 'Kurtyny powietrzne',                            2),
(222, 'Isofix',                                       2),
(223, 'System eCall (automatyczne powiadamianie)',     2),
(224, 'Asystent jazdy w korku (TJA)',                  2),
(225, 'Rozpoznawanie znaków drogowych',                2);

-- ── 3c. Komfort (cat 3) ────────────────────────────────────

INSERT IGNORE INTO `Features` (`id`, `name`, `CategoryId`) VALUES
(301, 'Klimatyzacja manualna',                        3),
(302, 'Klimatyzacja automatyczna (1-stref.)',          3),
(303, 'Klimatyzacja dwustrefowa',                     3),
(304, 'Klimatyzacja trójstrefowa / czterostrefowa',   3),
(305, 'Podgrzewane fotele przednie',                  3),
(306, 'Podgrzewane fotele tylne',                     3),
(307, 'Wentylowane fotele przednie',                  3),
(308, 'Fotel z funkcją masażu',                       3),
(309, 'Elektrycznie regulowane fotele przednie',      3),
(310, 'Elektryczna klapa bagażnika',                  3),
(311, 'Hands-free boot (otwieranie nogą)',             3),
(312, 'Podgrzewana kierownica',                       3),
(313, 'Keyless entry (bezkluczykowy dostęp)',          3),
(314, 'Przycisk start/stop',                          3),
(315, 'Zdalny rozruch silnika',                       3),
(316, 'Szyberdach',                                   3),
(317, 'Panoramiczny dach szklany',                    3),
(318, 'Roletka tylna (elektryczna)',                  3),
(319, 'Elektrycznie składane lusterka',               3),
(320, 'Pamięć ustawień fotela kierowcy',              3),
(321, 'Podgrzewana szyba przednia',                   3),
(322, 'Podgrzewana szyba tylna',                      3),
(323, 'Spryskiwacze reflektorów',                     3),
(324, 'Automatyczne wycieraczki',                     3),
(325, 'Regulacja kolumny kierownicy (elektryczna)',    3);

-- ── 3d. Systemy wspomagania (cat 4) ───────────────────────

INSERT IGNORE INTO `Features` (`id`, `name`, `CategoryId`) VALUES
(401, 'Aktywny tempomat z Stop&Go',                   4),
(402, 'Autoparking (park assist)',                    4),
(403, 'Automatyczne parkowanie równoległe',           4),
(404, 'Automatyczne parkowanie prostopadłe',          4),
(405, 'Asystent cofania (trailer assist)',             4),
(406, 'Asystent zmiany pasa (LCA)',                   4),
(407, 'Asystent wyjazdu z parkingu',                  4),
(408, 'Asystent skrzyżowań',                          4),
(409, 'Ogranicznik prędkości (ISA)',                  4),
(410, 'System utrzymania pojazdu w pasie (LKA Pro)',  4);

-- ── 3e. Oświetlenie (cat 5) ───────────────────────────────

INSERT IGNORE INTO `Features` (`id`, `name`, `CategoryId`) VALUES
(501, 'Reflektory LED',                               5),
(502, 'Reflektory Matrix LED',                        5),
(503, 'Reflektory laserowe',                          5),
(504, 'Reflektory ksenonowe (bi-xenon)',               5),
(505, 'Światła do jazdy dziennej LED (DRL)',           5),
(506, 'Adaptacyjne reflektory (AFS / skrętne)',        5),
(507, 'Oświetlenie ambientowe (ambient light)',        5),
(508, 'Podświetlane progi wejściowe',                 5),
(509, 'Reflektory z automatyczną regulacją zasięgu',  5),
(510, 'Tylne światła LED',                            5);

-- ── 3f. Wnętrze i tapicerka (cat 6) ──────────────────────

INSERT IGNORE INTO `Features` (`id`, `name`, `CategoryId`) VALUES
(601, 'Tapicerka skórzana',                           6),
(602, 'Tapicerka skórzana Alcantara',                 6),
(603, 'Tapicerka materiałowa premium',                6),
(604, 'Tapicerka welurowa',                           6),
(605, 'Drewniane wykończenie deski rozdzielczej',     6),
(606, 'Karbonowe wykończenie wnętrza',                6),
(607, 'Aluminiowe wykończenia pedałów',               6),
(608, 'Sportowa kierownica (skórzana)',                6),
(609, 'Dywaniki gumowe / welurowe',                   6),
(610, 'Przestrzeń bagażowa z elektryczną półką',      6);

-- ── 3g. Zewnętrzne i akcesoria (cat 7) ───────────────────

INSERT IGNORE INTO `Features` (`id`, `name`, `CategoryId`) VALUES
(701, 'Felgi aluminiowe 16"',                         7),
(702, 'Felgi aluminiowe 17"',                         7),
(703, 'Felgi aluminiowe 18"',                         7),
(704, 'Felgi aluminiowe 19"',                         7),
(705, 'Felgi aluminiowe 20" i większe',               7),
(706, 'Hak holowniczy (stały)',                       7),
(707, 'Hak holowniczy (chowany)',                     7),
(708, 'Relingi dachowe',                              7),
(709, 'Bagażnik dachowy',                             7),
(710, 'Podnóżki boczne',                              7),
(711, 'Osłona silnika plastikowa',                   7),
(712, 'Lakier metalik / perłowy',                    7),
(713, 'Ochronne listwy progowe',                      7),
(714, 'Kamery boczne (widok ze skrzydeł)',            7),
(715, 'Wlot powietrza sportowy',                      7);

-- ── 3h. Napęd i układ jezdny (cat 8) ─────────────────────

INSERT IGNORE INTO `Features` (`id`, `name`, `CategoryId`) VALUES
(801, 'Napęd 4×4 stały',                             8),
(802, 'Napęd AWD (na żądanie)',                       8),
(803, 'Blokada mechanizmu różnicowego',               8),
(804, 'Zawieszenie adaptacyjne',                     8),
(805, 'Zawieszenie pneumatyczne',                    8),
(806, 'Regulacja prześwitu',                         8),
(807, 'Skrzynia DSG / DCT (dwusprzęgłowa)',           8),
(808, 'Skrzynia CVT (bezstopniowa)',                  8),
(809, 'Tryby jazdy (Sport / Eco / Comfort)',          8),
(810, 'System start-stop',                           8),
(811, 'Plug-in Hybrid (PHEV)',                       8),
(812, 'Miękka hybryda (MHEV)',                       8),
(813, 'Pełna hybryda (HEV)',                         8),
(814, 'Elektryczny (BEV)',                           8),
(815, 'Ograniczone koło zapasowe (dojazdowe)',        8),
(816, 'Zbiornik pełnowymiarowe koło zapasowe',        8);

-- ── 3i. Specjalne – Ciężarówki (cat 9) ───────────────────

INSERT IGNORE INTO `Features` (`id`, `name`, `CategoryId`) VALUES
(901, 'Klimatyzacja kabiny (postojowa)',               9),
(902, 'Lodówka / chłodziarka w kabinie',              9),
(903, 'Sypialnia w kabinie',                          9),
(904, 'Tachograf cyfrowy',                            9),
(905, 'Retarder / hamulec silnikowy',                 9),
(906, 'Pneumatyczne zawieszenie osi',                 9),
(907, 'Skrzynia automatyczna / Powershift',           9),
(908, 'Dopuszczenie ADR (transport materiałów niebezpiecznych)', 9),
(909, 'Rampa załadunkowa',                            9),
(910, 'Winda załadunkowa (HIAB)',                     9),
(911, 'Hydraulika zewnętrzna',                        9),
(912, 'Wywrotka trójstronna',                         9),
(913, 'Zabudowa izoterma',                            9),
(914, 'Zabudowa chłodnia (frigo)',                    9),
(915, 'System monitorowania osi',                     9),
(916, 'EBS (elektroniczny układ hamulcowy)',           9),
(917, 'Wąskie koła kierujące (Super Single)',         9),
(918, 'Kamera cofania ciężarówki',                    9),
(919, 'Zestaw narzędzi na pojeździe',                 9),
(920, 'System zarządzania flotą (GPS)',                9);

-- ── 3j. Specjalne – Motocykle (cat 10) ───────────────────

INSERT IGNORE INTO `Features` (`id`, `name`, `CategoryId`) VALUES
(1001, 'ABS (przeciwblokujący)',                     10),
(1002, 'Kontrola trakcji (TCS)',                      10),
(1003, 'Tryby jazdy (Rain / Sport / Track)',          10),
(1004, 'Quickshifter (bezsprzęgłowa zmiana biegów)', 10),
(1005, 'Tempomat',                                   10),
(1006, 'Asystent ruszania pod górę',                 10),
(1007, 'Reflektory LED',                              10),
(1008, 'Wyświetlacz TFT / LCD',                      10),
(1009, 'Podgrzewane manetki',                        10),
(1010, 'Podgrzewane siedzenie',                      10),
(1011, 'Kufer boczny (twardy)',                      10),
(1012, 'Kufer centralny (twardy)',                   10),
(1013, 'Ochrona silnika (crashbary)',                 10),
(1014, 'Walizki miękkie',                            10),
(1015, 'Bluetooth / interfejs audio',                10),
(1016, 'Nawigacja GPS (na kierownicy)',               10),
(1017, 'Zawieszenie regulowane',                     10),
(1018, 'Pompki powietrza w zawieszeniu',              10),
(1019, 'Opony radiale (sport touring)',               10),
(1020, 'Gumowe nakładki na podnóżki',                10);

-- ── 3k. Specjalne – Dostawcze (cat 11) ───────────────────

INSERT IGNORE INTO `Features` (`id`, `name`, `CategoryId`) VALUES
(1101, 'Klimatyzacja kabiny',                        11),
(1102, 'Przegroda kabina/ładownia',                  11),
(1103, 'Podłoga antypoślizgowa w ładowni',           11),
(1104, 'Regały / organizery w ładowni',              11),
(1105, 'Roleta ładowni',                             11),
(1106, 'Winda załadunkowa tylna',                    11),
(1107, 'Drzwi przesuwne boczne (prawe)',              11),
(1108, 'Drzwi przesuwne boczne (obie strony)',        11),
(1109, 'Drzwi tylne dwuskrzydłowe',                  11),
(1110, 'Podgrzewana ładownia (izoterma)',             11),
(1111, 'Chłodnia / agregat chłodniczy',              11),
(1112, 'Szklana bula (zabudowa do transportu)',      11),
(1113, 'Kamera cofania',                             11),
(1114, 'System flotowy GPS',                         11),
(1115, 'Hamulec postojowy elektryczny',              11),
(1116, 'Tempomat',                                   11);

-- ── 3l. Specjalne – Przyczepy i naczepy (cat 12) ─────────

INSERT IGNORE INTO `Features` (`id`, `name`, `CategoryId`) VALUES
(1201, 'Oś skrętna (steering axle)',                 12),
(1202, 'Oś podnoszona (lifting axle)',                12),
(1203, 'Pneumatyczne zawieszenie osi',               12),
(1204, 'Hydraulika naczepy',                         12),
(1205, 'Winda załadunkowa (tail lift)',               12),
(1206, 'Plandeka (płachta) z markizą',               12),
(1207, 'Wywrotka trójstronna (naczepowa)',            12),
(1208, 'Naczepa chłodnia / frigo',                   12),
(1209, 'Agregat chłodniczy (Carrier / Thermo King)', 12),
(1210, 'Naczepa silosowa',                           12),
(1211, 'Naczepa do przewozu bydła',                  12),
(1212, 'Zabudowa kontenerowa',                       12),
(1213, 'Rampa aluminiowa',                           12),
(1214, 'Burty aluminiowe',                           12),
(1215, 'Koło zapasowe',                              12),
(1216, 'Czujniki ciśnienia w oponach',               12),
(1217, 'System stabilizacji jazdy (RSS)',             12),
(1218, 'Homologacja dopuszczenia ADR',               12);

-- ── 3m. Specjalne – Maszyny budowlane (cat 13) ───────────

INSERT IGNORE INTO `Features` (`id`, `name`, `CategoryId`) VALUES
(1301, 'Klimatyzacja kabiny operatora',              13),
(1302, 'Kabina ROPS/FOPS (antywywrotowa)',            13),
(1303, 'Kamera cofania / 360°',                      13),
(1304, 'System monitorowania pracy (telematyka)',     13),
(1305, 'Łyżka skalna (wzmocniona)',                  13),
(1306, 'Łyżka ładunkowa',                            13),
(1307, 'Układ hydrauliczny szybkozłącza',            13),
(1308, 'Wychylenie łyżki boczne',                    13),
(1309, 'Złącze szybkowymienialne (quick coupler)',   13),
(1310, 'Silnik Tier 4 / Stage V (niskoemisyjny)',    13),
(1311, 'Automatyczna skrzynia biegów',               13),
(1312, 'Napęd gąsienicowy',                          13),
(1313, 'Napęd kołowy 4×4',                           13),
(1314, 'Udźwig / nośność certyfikowany',             13),
(1315, 'Rozszerzony zasięg ramienia',                13),
(1316, 'Oświetlenie robocze LED',                    13),
(1317, 'Radio CB / komunikacja',                     13),
(1318, 'Gaśnica i apteczka (wymagane)',              13);

-- ── 3n. Specjalne – Maszyny rolnicze (cat 14) ────────────

INSERT IGNORE INTO `Features` (`id`, `name`, `CategoryId`) VALUES
(1401, 'Klimatyzacja kabiny',                        14),
(1402, 'GPS / prowadzenie równoległe',               14),
(1403, 'Autopilot / autosterowanie',                 14),
(1404, 'Koła bliźniacze (dual wheels)',              14),
(1405, 'Ładowacz czołowy',                           14),
(1406, 'Przystawka przednia (PTO Front)',             14),
(1407, 'Przystawka tylna 540/1000 obr/min',          14),
(1408, 'Hydraulika zewnętrzna (3 obwody)',            14),
(1409, 'ISOBUS (standard komunikacji maszyn)',        14),
(1410, 'Układanie rzędowe / siewnik precyzyjny',     14),
(1411, 'Nisko emisyjny silnik (Stage V)',             14),
(1412, 'Pneumatyczne opony rolnicze',                14),
(1413, 'Spryskiwacz polowy (belka opryskująca)',     14),
(1414, 'Prasa zbierająca (bele okrągłe)',            14),
(1415, 'Zbieracz kamieni / odkamieniarka',            14),
(1416, 'Drenaż (system drenażowy)',                  14),
(1417, 'Sygnalizacja awarii (system diagnostyczny)', 14),
(1418, 'Licznik hektarów / prędkości roboczej',      14);

-- ============================================================
-- Done. Reset AUTO_INCREMENT above max inserted IDs if needed:
-- ALTER TABLE `CarColors` AUTO_INCREMENT = 200;
-- ALTER TABLE `Features` AUTO_INCREMENT = 2000;
-- ============================================================
