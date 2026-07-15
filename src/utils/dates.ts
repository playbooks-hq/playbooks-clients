import Dayjs from 'dayjs';
import AdvancedFormat from 'dayjs/plugin/advancedFormat.js';
import QuarterOfYear from 'dayjs/plugin/quarterOfYear.js';
import RelativeTime from 'dayjs/plugin/relativeTime.js';
import Timezone from 'dayjs/plugin/timezone.js';
import UTC from 'dayjs/plugin/utc.js';

Dayjs.extend(AdvancedFormat);
Dayjs.extend(QuarterOfYear);
Dayjs.extend(RelativeTime);
Dayjs.extend(Timezone);
Dayjs.extend(UTC);

export const dayjs = Dayjs;

export const formatDate = (value?, format?) => {
	return Dayjs(value).format(format || 'MMM Do, YYYY @ hh:mmA');
};
