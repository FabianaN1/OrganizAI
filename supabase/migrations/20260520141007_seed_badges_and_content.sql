
/*
  # Seed Data — Badges, Content Library, Support Groups, Modules
*/

-- BADGES
INSERT INTO badges (name, description, icon, color, condition_type, condition_value) VALUES
  ('Primeiro Passo', 'Completou o primeiro check-in diario', 'footprints', '#10b981', 'checkins', 1),
  ('3 Dias Forte', 'Manteve streak de 3 dias', 'flame', '#f59e0b', 'streak', 3),
  ('Uma Semana!', 'Manteve streak de 7 dias — uma semana inteira!', 'star', '#3b82f6', 'streak', 7),
  ('Duas Semanas', 'Streak de 14 dias — voce esta transformando sua vida', 'zap', '#8b5cf6', 'streak', 14),
  ('Um Mes', 'Streak de 30 dias — conquista extraordinaria!', 'trophy', '#ef4444', 'streak', 30),
  ('Estudante', 'Completou 5 modulos educativos', 'book-open', '#06b6d4', 'modules', 5),
  ('Dedicado', 'Completou 10 modulos educativos', 'graduation-cap', '#0ea5e9', 'modules', 10),
  ('100 Pontos', 'Acumulou 100 pontos', 'coins', '#d97706', 'points', 100),
  ('500 Pontos', 'Acumulou 500 pontos', 'gem', '#dc2626', 'points', 500),
  ('Apoiador', 'Participou de um grupo de apoio', 'users', '#059669', 'special', 1)
ON CONFLICT DO NOTHING;

-- CONTENT LIBRARY
INSERT INTO content_library (title, summary, source_name, source_url, content_type, tags, substance_tag, reading_time_minutes, is_featured) VALUES
(
  'Relatorio Global sobre Alcool e Saude 2022 — OMS',
  'O alcool e responsavel por 3 milhoes de mortes por ano (5,3% de todas as mortes globais). O uso nocivo de alcool e fator de risco para mais de 200 doencas e lesoes, incluindo cancer, cirrose e acidentes de transito.',
  'Organizacao Mundial da Saude (OMS)',
  'https://www.who.int/publications/i/item/9789240010895',
  'guide',
  ARRAY['saude', 'alcool', 'epidemiologia', 'mortalidade'],
  'alcohol',
  8,
  true
),
(
  'O alcool como a droga mais prejudicial — The Lancet, 2010',
  'Estudo multicriterio de Nutt et al. avaliou 20 substancias por 16 criterios de dano. O alcool obteve pontuacao total de 72/100, superando heroina (55) e crack (54). Conclusao: o alcool e a substancia legal mais prejudicial ao conjunto individuo/sociedade.',
  'The Lancet — Nutt DJ et al.',
  'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(10)61462-6/fulltext',
  'article',
  ARRAY['alcool', 'danos', 'dependencia', 'pesquisa', 'evidencia cientifica'],
  'alcohol',
  12,
  true
),
(
  'Cessacao do tabagismo — beneficios e abordagens',
  'A OMS e o INCA documentam que parar de fumar reduz o risco de infarto em 50% apos 1 ano. Terapias de reposicao de nicotina e apoio comportamental dobram as chances de sucesso na cessacao.',
  'OMS / INCA (Instituto Nacional de Cancer)',
  'https://www.inca.gov.br/tabagismo/parar-de-fumar',
  'guide',
  ARRAY['tabaco', 'cessacao', 'saude', 'terapia', 'nicotina'],
  'tobacco',
  7,
  true
),
(
  'Sindrome de dependencia do alcool — criterios e tratamento',
  'O DSM-5 e a CID-11 definem criterios diagnosticos para transtorno por uso de alcool. Abordagens terapeuticas incluem TCC, entrevista motivacional, farmacoterapia (naltrexona, acamprosato) e grupos de suporte.',
  'APA — American Psychiatric Association',
  'https://www.psychiatry.org/patients-families/alcohol-use-disorder',
  'article',
  ARRAY['alcool', 'dependencia', 'tratamento', 'saude mental', 'TCC'],
  'alcohol',
  10,
  false
),
(
  'Impacto do tabaco no Brasil — Dados INCA 2023',
  'O tabagismo e a principal causa evitavel de morte no Brasil, responsavel por 443 obitos/dia. O Brasil reduziu prevalencia de fumantes de 32% (1989) para 9,8% (2023) gracas a politicas publicas robustas.',
  'INCA — Instituto Nacional de Cancer',
  'https://www.inca.gov.br/observatorio-da-politica-nacional-de-controle-do-tabaco',
  'statistic',
  ARRAY['tabaco', 'Brasil', 'epidemiologia', 'politicas publicas', 'SUS'],
  'tobacco',
  6,
  false
),
(
  'Entrevista Motivacional para cessacao de substancias',
  'A entrevista motivacional (EM), desenvolvida por Miller e Rollnick, fortalece a motivacao intrinseca para mudanca. Metanalises mostram eficacia significativa para reducao de alcool e tabaco em comparacao a conselhos breves.',
  'Miller WR, Rollnick S — Motivational Interviewing',
  'https://www.motivationalinterviewing.org/',
  'article',
  ARRAY['motivacao', 'mudanca de comportamento', 'psicologia', 'cessacao', 'estrategia'],
  'both',
  9,
  false
),
(
  'AUDIT — Teste de identificacao de transtornos por uso de alcool',
  'O AUDIT e um questionario de 10 perguntas desenvolvido pela OMS para triagem de uso problematico de alcool. Pontuacao 8+ indica uso problematico; 15+ indica dependencia provavel.',
  'OMS — Alcohol Use Disorders Identification Test',
  'https://www.who.int/publications/i/item/audit-the-alcohol-use-disorders-identification-test',
  'guide',
  ARRAY['alcool', 'triagem', 'diagnostico', 'ferramenta', 'OMS'],
  'alcohol',
  5,
  false
),
(
  'Mindfulness para controle de craving',
  'O programa MBRP (Mindfulness-Based Relapse Prevention) mostrou reducao de 54% na recaida em comparacao ao tratamento convencional para dependencia de substancias.',
  'Bowen S et al. — MBRP Research',
  'https://www.mindfulrp.com/',
  'article',
  ARRAY['mindfulness', 'craving', 'prevencao de recaida', 'meditacao', 'estrategia'],
  'both',
  8,
  true
)
ON CONFLICT DO NOTHING;

-- DEFAULT SUPPORT GROUPS
INSERT INTO support_groups (name, description, substance_focus, max_members, is_private) VALUES
  ('Liberdade do Alcool', 'Grupo de apoio para quem quer reduzir ou parar de beber. Espaco seguro, anonimo e sem julgamentos.', 'alcohol', 50, false),
  ('Sem Fumaca', 'Comunidade de apoio para cessacao do tabagismo. Compartilhe sua jornada, dicas e conquistas.', 'tobacco', 50, false),
  ('Jornada Completa', 'Para quem quer se libertar tanto do alcool quanto do tabaco ao mesmo tempo.', 'both', 50, false),
  ('Profissionais de Saude', 'Grupo para medicos, enfermeiros, psicologos e outros profissionais que acompanham pacientes na jornada.', 'both', 30, false)
ON CONFLICT DO NOTHING;

-- MODULES
INSERT INTO modules (title, description, module_type, substance_tag, difficulty, duration_minutes, points_reward, content, order_index) VALUES
(
  'Por que parar? Os numeros que importam',
  'Conheca os dados da OMS sobre alcool e tabaco e entenda por que a decisao de mudar e tao poderosa.',
  'lesson',
  'both',
  'easy',
  3,
  50,
  '{"sections":[{"type":"text","title":"A dimensao do problema","body":"Segundo a OMS (2022), o tabaco mata mais de 8 milhoes de pessoas por ano globalmente, e o alcool e responsavel por 3 milhoes de mortes anuais. Um estudo multicriterio publicado no The Lancet (Nutt et al., 2010) classificou o alcool como a substancia que causa mais dano combinado ao individuo e a sociedade entre todas as drogas avaliadas."},{"type":"highlight","text":"A boa noticia: os beneficios a saude comecam nas primeiras 24 horas apos parar de fumar e nas primeiras semanas ao reduzir o alcool."},{"type":"source","refs":["OMS Global Status Report on Alcohol and Health 2022","Nutt DJ et al. Drug harms in the UK. The Lancet. 2010;376(9752):1558-1565."]}]}',
  1
),
(
  'Quiz: Quanto voce sabe sobre alcool?',
  'Teste seus conhecimentos sobre os efeitos do alcool no corpo e descubra mitos e verdades.',
  'quiz',
  'alcohol',
  'easy',
  5,
  75,
  '{"questions":[{"question":"O alcool e uma substancia depressora do sistema nervoso central?","options":["Sim","Nao","Depende da quantidade","So em doses altas"],"correct":0,"explanation":"Correto! Apesar de causar sensacao de euforia inicial, o alcool e um depressor do SNC."},{"question":"Quantas semanas sem alcool para o figado comecar a se recuperar?","options":["1 semana","2 a 4 semanas","3 meses","1 ano"],"correct":1,"explanation":"O figado comeca recuperacao significativa entre 2 a 4 semanas de abstinencia."},{"question":"Qual e a definicao da OMS para uso nocivo de alcool?","options":["Beber todos os dias","Padrao que causa dano a saude fisica ou mental","Beber mais de 2 doses por vez","Misturar com medicamentos"],"correct":1,"explanation":"A OMS define uso nocivo como qualquer padrao que cause dano a saude fisica, mental ou social."}]}',
  2
),
(
  'Os 5 primeiros dias sem tabaco',
  'Saiba o que seu corpo esta passando nos primeiros dias de abstinencia do tabaco e como lidar com os sintomas.',
  'lesson',
  'tobacco',
  'easy',
  4,
  60,
  '{"sections":[{"type":"timeline","items":[{"time":"20 minutos","benefit":"Pressao arterial e frequencia cardiaca normalizam"},{"time":"8 horas","benefit":"Niveis de monoxido de carbono no sangue caem pela metade"},{"time":"24 horas","benefit":"Risco de ataque cardiaco comeca a diminuir"},{"time":"48 horas","benefit":"Nervos olfativos se regeneram; olfato e paladar melhoram"},{"time":"72 horas","benefit":"Bronquios relaxam; respirar fica mais facil"}]},{"type":"tip","title":"Dica para crises de abstinencia","body":"A fissura dura em media 3 a 5 minutos. Tecnica 4-7-8: inspire por 4s, segure por 7s, expire por 8s. Repita 3 vezes."},{"type":"source","refs":["NHS — Stop Smoking Benefits Timeline","INCA — Instituto Nacional de Cancer (Brasil)"]}]}',
  3
),
(
  'Desafio: Hidratacao inteligente',
  'Por 24 horas, substitua bebidas alcoolicas por agua e registre como se sentiu.',
  'challenge',
  'alcohol',
  'easy',
  2,
  80,
  '{"instructions":"Cada vez que sentir vontade de beber alcool, beba um copo de agua gelada e espere 10 minutos. Registre quantas vezes conseguiu substituir.","goal":"Substituir pelo menos 3 tentativas de consumo por hidratacao","reflection_prompt":"Como voce se sentiu fisicamente? Notou alguma diferenca no humor ou na clareza mental?"}',
  4
),
(
  'Gatilhos e estrategias de enfrentamento',
  'Identifique seus gatilhos pessoais e aprenda tecnicas baseadas em evidencias para lidar com eles.',
  'reflection',
  'both',
  'medium',
  5,
  70,
  '{"intro":"Gatilhos sao situacoes, emocoes ou ambientes que aumentam a vontade de consumir. Reconhece-los e o primeiro passo.","common_triggers":["Estresse no trabalho","Situacoes sociais","Solidao","Apos refeicoes","Associacao com pessoas que consomem"],"strategies":[{"name":"Respiracao diafragmatica","description":"Ativa o sistema nervoso parassimpatico, reduzindo ansiedade em minutos."},{"name":"Substituicao de habito","description":"Associe o gatilho a um novo comportamento positivo (cha, caminhada, ligacao para amigo)."},{"name":"Tecnica STOP","description":"Stop (pare), Take a breath (respire), Observe (observe seus sentimentos), Proceed (prossiga conscientemente)."}],"reflection_prompt":"Liste seus 3 principais gatilhos e uma estrategia para cada um.","source":"Baseado em Terapia Cognitivo-Comportamental — APA Practice Guidelines"}',
  5
),
(
  'Quiz: Mitos e verdades sobre tabaco',
  'Desmistifique crencas comuns sobre tabaco e cigarro eletronico.',
  'quiz',
  'tobacco',
  'medium',
  5,
  75,
  '{"questions":[{"question":"Cigarro eletronico (vape) e seguro porque nao tem fumaca?","options":["Verdade","Mito — tem aerossol toxico","Depende da marca","So e perigoso para jovens"],"correct":1,"explanation":"Mito! O aerossol do vape contem nicotina, metais pesados e substancias quimicas toxicas."},{"question":"Fumar social apenas em festas nao causa dependencia?","options":["Verdade","Mito — qualquer uso pode criar dependencia","So se fumar mais de 5 cigarros","Depende da genetica"],"correct":1,"explanation":"Mito! A nicotina e altamente aditiva. Mesmo o uso ocasional pode criar e reforcar padroes de dependencia."},{"question":"Parar de fumar aos 40 anos ainda traz beneficios significativos a saude?","options":["Nao — o dano ja e permanente","Sim — reduz risco de morte prematura em ate 50%","So se parar antes dos 35","Os beneficios sao minimos"],"correct":1,"explanation":"Sim! Parar aos 40 anos reduz em cerca de 50% o risco de morte prematura por doencas relacionadas ao tabaco (Doll et al., BMJ 2004)."}]}',
  6
)
ON CONFLICT DO NOTHING;
