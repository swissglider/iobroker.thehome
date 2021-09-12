export const getName = (name: ioBroker.StringOrTranslated): string => {
	if (typeof name === 'string') {
		return name;
	} else if (typeof name === 'object' && 'de' in name && name.de) {
		return name.de;
	} else if (typeof name === 'object' && 'en' in name && name.en) {
		return name.en;
	} else {
		return name.toString();
	}
};
