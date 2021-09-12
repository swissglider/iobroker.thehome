export const getName = (name: ioBroker.StringOrTranslated, systemLanguage: ioBroker.Languages = 'en'): string => {
	if (typeof name === 'string') {
		return name;
	} else if (typeof name === 'object' && systemLanguage in name && name[systemLanguage]) {
		return name[systemLanguage] as string;
	} else if (typeof name === 'object' && 'en' in name && name.en) {
		return name.en;
	} else if (typeof name === 'object' && 'de' in name && name.de) {
		return name.de;
	} else {
		return name.toString();
	}
};
