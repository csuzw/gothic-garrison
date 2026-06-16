type Pool = { first: string[]; surnames?: string[] };
type GenderedPool = { male: Pool; female: Pool };

const nations: Record<string, GenderedPool> = {
  Austria: {
    male: {
      first: ['Johann', 'Franz', 'Karl', 'Josef', 'Wilhelm', 'Heinrich', 'Friedrich', 'Georg', 'Ludwig', 'Maximilian', 'Ernst', 'August', 'Rudolf', 'Anton', 'Gottfried'],
      surnames: ['Müller', 'Schmidt', 'Fischer', 'Weber', 'Wagner', 'Bauer', 'Huber', 'Gruber', 'Maier', 'Leitner', 'Hofer', 'Zimmermann', 'Kramer', 'Steiner', 'Brunner'],
    },
    female: {
      first: ['Maria', 'Anna', 'Theresa', 'Josephine', 'Katharina', 'Elisabeth', 'Sophie', 'Wilhelmine', 'Eleonore', 'Christine', 'Franziska', 'Johanna', 'Barbara', 'Margarethe', 'Rosalia'],
      surnames: ['Müller', 'Schmidt', 'Fischer', 'Weber', 'Wagner', 'Bauer', 'Huber', 'Gruber', 'Maier', 'Leitner', 'Hofer', 'Zimmermann', 'Kramer', 'Steiner', 'Brunner'],
    },
  },

  Britain: {
    male: {
      first: ['William', 'Thomas', 'John', 'James', 'George', 'Henry', 'Edward', 'Charles', 'Richard', 'Robert', 'Samuel', 'Arthur', 'Frederick', 'Alfred', 'Walter'],
      surnames: ['Smith', 'Jones', 'Williams', 'Brown', 'Taylor', 'Davies', 'Evans', 'Wilson', 'Johnson', 'Walker', 'Cooper', 'Clarke', 'Wright', 'Robinson', 'Thompson'],
    },
    female: {
      first: ['Mary', 'Ann', 'Elizabeth', 'Jane', 'Sarah', 'Charlotte', 'Emma', 'Frances', 'Margaret', 'Catherine', 'Eleanor', 'Harriet', 'Louisa', 'Caroline', 'Agnes'],
      surnames: ['Smith', 'Jones', 'Williams', 'Brown', 'Taylor', 'Davies', 'Evans', 'Wilson', 'Johnson', 'Walker', 'Cooper', 'Clarke', 'Wright', 'Robinson', 'Thompson'],
    },
  },

  Calabresi: {
    male: {
      first: ['Antonio', 'Giuseppe', 'Giovanni', 'Francesco', 'Salvatore', 'Angelo', 'Domenico', 'Luigi', 'Carlo', 'Rocco', 'Carmelo', 'Nicola', 'Bruno', 'Sergio', 'Pasquale'],
      surnames: ['Russo', 'Esposito', 'Bianchi', 'Romano', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Mancuso', 'Piro', 'Foti', 'Sculli'],
    },
    female: {
      first: ['Maria', 'Rosa', 'Angela', 'Giuseppina', 'Carmela', 'Concetta', 'Lucia', 'Teresa', 'Anna', 'Filomena', 'Rosaria', 'Caterina', 'Vittoria', 'Assunta', 'Annunziata'],
      surnames: ['Russo', 'Esposito', 'Bianchi', 'Romano', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Mancuso', 'Piro', 'Foti', 'Sculli'],
    },
  },

  Egypt: {
    male: {
      first: ['Ahmed', 'Mohammed', 'Hassan', 'Ibrahim', 'Mustafa', 'Ali', 'Omar', 'Yusuf', 'Khalil', 'Mahmoud', 'Salim', 'Tariq', 'Rashid', 'Karim', 'Nabil'],
      surnames: ['Al-Rashid', 'Al-Masri', 'Al-Azhari', 'Ibn Yusuf', 'Al-Husseini', 'Al-Qahtani', 'Al-Shafi\'i', 'Al-Fayoumi', 'Al-Sayed', 'Al-Ghamdi', 'Khalifa', 'Mansour', 'Barakat', 'Selim', 'Amin'],
    },
    female: {
      first: ['Fatima', 'Aisha', 'Zainab', 'Maryam', 'Khadija', 'Safiya', 'Nour', 'Layla', 'Hanan', 'Amira', 'Yasmine', 'Samira', 'Rania', 'Salma', 'Nadia'],
      surnames: ['Al-Rashid', 'Al-Masri', 'Al-Azhari', 'Bint Yusuf', 'Al-Husseini', 'Al-Qahtani', 'Al-Shafi\'i', 'Al-Fayoumi', 'Al-Sayed', 'Al-Ghamdi', 'Khalifa', 'Mansour', 'Barakat', 'Selim', 'Amin'],
    },
  },

  France: {
    male: {
      first: ['Jean', 'Louis', 'Pierre', 'François', 'Jacques', 'Henri', 'Charles', 'Nicolas', 'Antoine', 'Claude', 'Michel', 'René', 'Étienne', 'Julien', 'Armand'],
      surnames: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia'],
    },
    female: {
      first: ['Marie', 'Anne', 'Jeanne', 'Catherine', 'Marguerite', 'Louise', 'Françoise', 'Élisabeth', 'Suzanne', 'Madeleine', 'Hélène', 'Victoire', 'Adèle', 'Claire', 'Thérèse'],
      surnames: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Blanc'],
    },
  },

  'Kingdom of Naples': {
    male: {
      first: ['Ferdinando', 'Carlo', 'Gioacchino', 'Alfonso', 'Raffaele', 'Pasquale', 'Gennaro', 'Enrico', 'Nicola', 'Roberto', 'Vincenzo', 'Salvatore', 'Ettore', 'Marco', 'Adriano'],
      surnames: ['De Luca', 'Russo', 'Esposito', 'Ferrara', 'De Rosa', 'Martino', 'Conte', 'Longobardi', 'Farina', 'Palma', 'Napoli', 'Parisi', 'Rizzo', 'Iovino', 'Sansone'],
    },
    female: {
      first: ['Maria', 'Carolina', 'Antonia', 'Caterina', 'Isabella', 'Chiara', 'Elisabetta', 'Vittoria', 'Emilia', 'Rosaria', 'Concetta', 'Carmela', 'Filomena', 'Luisa', 'Giulia'],
      surnames: ['De Luca', 'Russo', 'Esposito', 'Ferrara', 'De Rosa', 'Martino', 'Conte', 'Longobardi', 'Farina', 'Palma', 'Napoli', 'Parisi', 'Rizzo', 'Iovino', 'Sansone'],
    },
  },

  'Lower Canada': {
    male: {
      first: ['Jean', 'Pierre', 'Louis', 'François', 'Jacques', 'Antoine', 'Charles', 'Joseph', 'Baptiste', 'Étienne', 'Alexis', 'Théophile', 'Honoré', 'Isidore', 'Narcisse'],
      surnames: ['Tremblay', 'Gagnon', 'Roy', 'Côté', 'Bouchard', 'Gauthier', 'Morin', 'Lavoie', 'Fortin', 'Ouellet', 'Bélanger', 'Pelletier', 'Lévesque', 'Bergeron', 'Poirier'],
    },
    female: {
      first: ['Marie', 'Anne', 'Marguerite', 'Geneviève', 'Madeleine', 'Françoise', 'Élisabeth', 'Isabelle', 'Catherine', 'Cécile', 'Angélique', 'Thérèse', 'Josephte', 'Rosalie', 'Émilie'],
      surnames: ['Tremblay', 'Gagnon', 'Roy', 'Côté', 'Bouchard', 'Gauthier', 'Morin', 'Lavoie', 'Fortin', 'Ouellet', 'Bélanger', 'Pelletier', 'Lévesque', 'Bergeron', 'Poirier'],
    },
  },

  Prussia: {
    male: {
      first: ['Friedrich', 'Wilhelm', 'Karl', 'Heinrich', 'Ernst', 'Georg', 'Otto', 'Ludwig', 'Gottfried', 'Maximilian', 'Konrad', 'Albrecht', 'Gerhard', 'Ulrich', 'Bernhard'],
      surnames: ['Müller', 'Schmidt', 'Weber', 'Fischer', 'Hoffmann', 'Braun', 'Koch', 'Schulz', 'Becker', 'Richter', 'Wolf', 'Krüger', 'Hartmann', 'Meyer', 'Zimmermann'],
    },
    female: {
      first: ['Friederike', 'Wilhelmine', 'Karoline', 'Henriette', 'Luise', 'Sophie', 'Charlotte', 'Amalie', 'Dorothea', 'Auguste', 'Ernestine', 'Mathilde', 'Klara', 'Bertha', 'Ottilie'],
      surnames: ['Müller', 'Schmidt', 'Weber', 'Fischer', 'Hoffmann', 'Braun', 'Koch', 'Schulz', 'Becker', 'Richter', 'Wolf', 'Krüger', 'Hartmann', 'Meyer', 'Zimmermann'],
    },
  },

  Russia: {
    male: {
      first: ['Ivan', 'Alexei', 'Nikolai', 'Dmitri', 'Pavel', 'Sergei', 'Mikhail', 'Boris', 'Vladimir', 'Pyotr', 'Fyodor', 'Konstantin', 'Andrei', 'Vasily', 'Grigory'],
      surnames: ['Ivanov', 'Petrov', 'Sidorov', 'Volkov', 'Morozov', 'Kozlov', 'Novikov', 'Lebedev', 'Fedorov', 'Popov', 'Sokolov', 'Mikhailov', 'Orlov', 'Nikitin', 'Kuznetsov'],
    },
    female: {
      first: ['Natasha', 'Irina', 'Olga', 'Tatiana', 'Anna', 'Elizaveta', 'Mariya', 'Varvara', 'Sophia', 'Alexandra', 'Darya', 'Ekaterina', 'Nadezhda', 'Yelena', 'Praskovya'],
      surnames: ['Ivanova', 'Petrova', 'Sidorova', 'Volkova', 'Morozova', 'Kozlova', 'Novikova', 'Lebedeva', 'Fedorova', 'Popova', 'Sokolova', 'Mikhailova', 'Orlova', 'Nikitina', 'Kuznetsova'],
    },
  },

  Spain: {
    male: {
      first: ['José', 'Antonio', 'Manuel', 'Francisco', 'Juan', 'Pedro', 'Miguel', 'Diego', 'Alejandro', 'Fernando', 'Carlos', 'Andrés', 'Ramón', 'Ignacio', 'Sebastián'],
      surnames: ['García', 'Martínez', 'López', 'Sánchez', 'González', 'Pérez', 'Rodríguez', 'Fernández', 'Romero', 'Torres', 'Navarro', 'Domínguez', 'Vázquez', 'Ramos', 'Moreno'],
    },
    female: {
      first: ['María', 'Ana', 'Isabel', 'Carmen', 'Josefa', 'Teresa', 'Francisca', 'Catalina', 'Dolores', 'Manuela', 'Concepción', 'Antonia', 'Rosario', 'Juana', 'Margarita'],
      surnames: ['García', 'Martínez', 'López', 'Sánchez', 'González', 'Pérez', 'Rodríguez', 'Fernández', 'Romero', 'Torres', 'Navarro', 'Domínguez', 'Vázquez', 'Ramos', 'Moreno'],
    },
  },

  'Trading Companies': {
    male: {
      first: ['William', 'James', 'Robert', 'Charles', 'Thomas', 'John', 'Henry', 'George', 'Alexander', 'Francis', 'Angus', 'Duncan', 'Donald', 'Hamish', 'Lachlan'],
      surnames: ['Forbes', 'Grant', 'Dundas', 'Macpherson', 'Palmer', 'Fletcher', 'MacTavish', 'MacDougall', 'Fraser', 'Ross', 'MacKenzie', 'Cameron', 'Sinclair', 'Robertson', 'MacKay'],
    },
    female: {
      first: ['Mary', 'Elizabeth', 'Jane', 'Sarah', 'Charlotte', 'Ann', 'Harriet', 'Frances', 'Caroline', 'Louisa', 'Fiona', 'Catriona', 'Flora', 'Elspeth', 'Jean'],
      surnames: ['Forbes', 'Grant', 'Dundas', 'Macpherson', 'Palmer', 'Fletcher', 'MacTavish', 'MacDougall', 'Fraser', 'Ross', 'MacKenzie', 'Cameron', 'Sinclair', 'Robertson', 'MacKay'],
    },
  },

  'United States': {
    male: {
      first: ['John', 'William', 'James', 'Thomas', 'George', 'Charles', 'Henry', 'Samuel', 'Joseph', 'Daniel', 'Elias', 'Ezra', 'Nathan', 'Caleb', 'Josiah'],
      surnames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Jackson', 'White', 'Harris', 'Martin'],
    },
    female: {
      first: ['Mary', 'Elizabeth', 'Sarah', 'Hannah', 'Abigail', 'Catherine', 'Rebecca', 'Martha', 'Lucy', 'Caroline', 'Patience', 'Mehitable', 'Prudence', 'Lydia', 'Deborah'],
      surnames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Jackson', 'White', 'Harris', 'Martin'],
    },
  },

  'Upper Canada': {
    male: {
      first: ['William', 'James', 'John', 'Thomas', 'George', 'Edward', 'Robert', 'Charles', 'Henry', 'Samuel', 'Duncan', 'Angus', 'Archibald', 'Donald', 'Malcolm'],
      surnames: ['Smith', 'Brown', 'Jones', 'Taylor', 'Wilson', 'MacDonald', 'Campbell', 'Stewart', 'Robertson', 'Murray', 'Fraser', 'MacLeod', 'Grant', 'Hamilton', 'Ross'],
    },
    female: {
      first: ['Mary', 'Ann', 'Elizabeth', 'Jane', 'Sarah', 'Charlotte', 'Emily', 'Margaret', 'Frances', 'Catherine', 'Isabella', 'Agnes', 'Janet', 'Flora', 'Jessie'],
      surnames: ['Smith', 'Brown', 'Jones', 'Taylor', 'Wilson', 'MacDonald', 'Campbell', 'Stewart', 'Robertson', 'Murray', 'Fraser', 'MacLeod', 'Grant', 'Hamilton', 'Ross'],
    },
  },
};

const fallback: GenderedPool = {
  male: {
    first: ['William', 'Jean', 'Johann', 'Friedrich', 'Pierre', 'Charles', 'Heinrich', 'Thomas', 'Georg', 'Louis'],
    surnames: ['Martin', 'Smith', 'Müller', 'Bernard', 'Fischer', 'Brown', 'Dubois', 'Schmidt', 'Jones', 'Weber'],
  },
  female: {
    first: ['Mary', 'Marie', 'Maria', 'Anne', 'Anna', 'Sophie', 'Charlotte', 'Katharina', 'Elizabeth', 'Louise'],
    surnames: ['Martin', 'Smith', 'Müller', 'Bernard', 'Fischer', 'Brown', 'Dubois', 'Schmidt', 'Jones', 'Weber'],
  },
};

const soldierTypeOverrides: Partial<Record<string, GenderedPool>> = {
  Highlander: {
    male: {
      first: ['Alasdair', 'Angus', 'Callum', 'Coll', 'Colin', 'Donald', 'Dougal', 'Duncan', 'Ewen', 'Fergus', 'Hamish', 'Iain', 'Lachlan', 'Malcolm', 'Murdoch', 'Neil', 'Ranald', 'Ruaridh', 'Seumas', 'Torquil'],
      surnames: ['Cameron', 'Campbell', 'Fraser', 'Gordon', 'Grant', 'MacDonald', 'MacDougall', 'MacGregor', 'MacKay', 'MacKenzie', 'MacLachlan', 'MacLean', 'MacLeod', 'MacNeil', 'MacPherson', 'MacTavish', 'Munro', 'Murray', 'Robertson', 'Ross', 'Sinclair', 'Stewart', 'Sutherland'],
    },
    female: {
      first: ['Beathag', 'Catriona', 'Eilidh', 'Elspeth', 'Effie', 'Fiona', 'Flora', 'Iseabail', 'Janet', 'Jean', 'Màiread', 'Màiri', 'Morag', 'Peggy', 'Seònaid', 'Sìleas', 'Sine'],
      surnames: ['Cameron', 'Campbell', 'Fraser', 'Gordon', 'Grant', 'MacDonald', 'MacDougall', 'MacGregor', 'MacKay', 'MacKenzie', 'MacLachlan', 'MacLean', 'MacLeod', 'MacNeil', 'MacPherson', 'MacTavish', 'Munro', 'Murray', 'Robertson', 'Ross', 'Sinclair', 'Stewart', 'Sutherland'],
    },
  },

  // Single names only — hereditary surnames were not part of First Nations / Native American naming tradition in this period.
  'Native Scout': {
    male: {
      first: ['Tecumseh', 'Pontiac', 'Thayendanegea', 'Sagoyewatha', 'Cornplanter', 'Matonabbee', 'Wabasha', 'Kenekuk', 'Oshkosh', 'Roundhead', 'Shabonee', 'Pushmataha', 'Junaluska', 'Skenandoa', 'Aupaumut', 'Shingask', 'Stayeghtha'],
    },
    female: {
      first: ['Sacagawea', 'Thanadelthur', 'Nanyehi', 'Weetamoo', 'Awashonks', 'Coocoochee', 'Waneta', 'Abishabis', 'Molly', 'Konwatsi\'tsiaienni', 'Wabananang', 'Onahsakenrat'],
    },
  },
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomName(nation: string | null, gender: 'male' | 'female', soldierType?: string | null): string {
  const pool = (soldierType ? soldierTypeOverrides[soldierType]?.[gender] : undefined)
    ?? (nation !== null ? nations[nation]?.[gender] : undefined)
    ?? fallback[gender];
  const first = pick(pool.first);
  return pool.surnames ? `${first} ${pick(pool.surnames)}` : first;
}
