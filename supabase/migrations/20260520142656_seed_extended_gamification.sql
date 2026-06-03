
/*
  # Seed Extended Gamification Data — Tribes, Virtual Gifts, Reward Items, Safe Places
*/

-- TRIBES
INSERT INTO tribes (name, description, icon, color, substance_focus, max_members) VALUES
  ('Guerreiros da Manha', 'Para quem comeca o dia sem ceder a tentacao. Levantamos juntos, mais fortes.', 'sunrise', '#f59e0b', 'both', 50),
  ('Caminho Sobrio', 'Comunidade focada em rebuildar a vida sem alcool, um dia de cada vez.', 'compass', '#10b981', 'alcohol', 50),
  ('Respiracao Livre', 'Ex-fumantes que reconquistaram o ar. Sem cigarro, sem vape, sem correntes.', 'wind', '#06b6d4', 'tobacco', 50),
  ('Tribro Urbano', 'Jovens urbanos que escolheram a noite sem excessos. Cultura, esporte e conexao real.', 'building', '#3b82f6', 'both', 50),
  ('Familia que Cuida', 'Familiares e amigos de quem esta na jornada. Apoio de quem entende.', 'heart-handshake', '#ec4899', 'both', 50)
ON CONFLICT DO NOTHING;

-- VIRTUAL GIFTS
INSERT INTO virtual_gifts (name, description, icon, cost_points) VALUES
  ('Cafe Virtual', 'Um cafe quentinho para comecar o dia bem', 'coffee', 10),
  ('Medalha de Honra', 'Reconhecimento pela forca e determinacao', 'medal', 25),
  ('Abreaco Digital', 'Um abraco de quem entende sua luta', 'heart', 15),
  ('Escudo de Forca', 'Protecao contra os momentos mais dificeis', 'shield', 30),
  ('Estrela Guia', 'Iluminando o caminho de quem precisa', 'sparkles', 20),
  ('Coroa de Ouro', 'Para os mais dedicados da Tribo', 'crown', 50)
ON CONFLICT DO NOTHING;

-- REWARD ITEMS
INSERT INTO reward_items (name, description, icon, category, cost_points) VALUES
  ('Avatar Lendario', 'Desbloqueie um avatar exclusivo de mentor', 'crown', 'avatar', 500),
  ('Cores da Tribo', 'Personalize seu perfil com as cores da sua Tribo', 'palette', 'cosmetic', 200),
  ('Moldura Dourada', 'Moldura especial ao redor do seu avatar', 'frame', 'cosmetic', 300),
  ('Badge Personalizado', 'Crie um titulo personalizado no perfil', 'tag', 'cosmetic', 150),
  ('Titulo de Mentor', 'Exiba seu titulo de mentor da comunidade', 'award', 'title', 400),
  ('Efeito de Entrada', 'Efeito visual animado ao entrar no chat', 'sparkles', 'effect', 250),
  ('Selo de 100 Dias', 'Selo comemorativo de 100 dias limpo', 'badge-check', 'badge', 350),
  ('Insignia Elite', 'Insignia para membros de nivel Elite', 'shield-check', 'badge', 600)
ON CONFLICT DO NOTHING;

-- SAFE PLACES (sample locations in Brazilian cities)
INSERT INTO safe_places (name, description, place_type, address, latitude, longitude, city, is_verified) VALUES
  ('Cafe com Letras', 'Cafe cultural com ambiente acolhedor, sem foco em alcool. Eventos literarios e musica ao vivo.', 'cafe', 'Rua Aires da Mata, 38 - Santa Teresa, Rio de Janeiro', -22.9239, -43.1877, 'Rio de Janeiro', true),
  ('Parque Ibirapuera', 'Parque urbano com areas para caminhada, meditacao e exercicios. Ambiente saudavel e aberto.', 'park', 'Av. Pedro Alvares Cabral - Vila Mariana, Sao Paulo', -23.5874, -46.6576, 'Sao Paulo', true),
  ('Museu de Arte do RS', 'Espaco cultural tranquilo para contemplacao e enriquecimento mental.', 'museum', 'Av. Borges de Medeiros, 955 - Porto Alegre', -30.0346, -51.2177, 'Porto Alegre', true),
  ('Cafe Siropa', 'Cafe artesanal com opcoes sem alcool e ambiente descontraido.', 'cafe', 'Rua da Mooca, 1200 - Mooca, Sao Paulo', -23.5631, -46.6008, 'Sao Paulo', true),
  ('Parque da Cidade', 'Area verde ampla para atividades fisicas e encontros ao ar livre.', 'park', 'SCS Eq. 9/11 - Asa Sul, Brasilia', -15.7975, -47.8912, 'Brasilia', true),
  ('Biblioteca Publica do Estado', 'Silencio, conhecimento e comunidade em um espaco seguro.', 'library', 'Rua das Flores, 174 - Centro, Curitiba', -25.4284, -49.2734, 'Curitiba', true),
  ('Cafe Botanica', 'Cafe com ambiente zen, jardim interno e opcoes saudaveis.', 'cafe', 'Rua Joaquim Floriano, 608 - Itaim Bibi, Sao Paulo', -23.5789, -46.6802, 'Sao Paulo', true),
  ('Orla de Copacabana', 'Caladao a beira-mar para caminhada, meditacao e esportes.', 'park', 'Av. Atlantica - Copacabana, Rio de Janeiro', -22.9714, -43.1823, 'Rio de Janeiro', true)
ON CONFLICT DO NOTHING;
