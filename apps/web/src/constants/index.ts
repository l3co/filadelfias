/**
 * Centralized Constants Exports
 */

// Member constants
export { 
  OFFICE_OPTIONS,
  FUNCTION_OPTIONS,
  STATUS_OPTIONS,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  ADMISSION_TYPE_OPTIONS,
  OFFICE_LABELS,
  FUNCTION_LABELS,
  STATUS_LABELS,
} from './member.constants';
export type { SelectOption } from './member.constants';

// Financial constants
export {
  ACCOUNT_TYPE_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
  CATEGORY_TYPE_OPTIONS,
  ACCOUNT_TYPE_LABELS,
  TRANSACTION_TYPE_LABELS,
  CATEGORY_TYPE_LABELS,
} from './financial.constants';

// Governance constants
export {
  COUNCIL_TYPE_OPTIONS,
  MEETING_STATUS_OPTIONS,
  COUNCIL_TYPE_LABELS,
  MEETING_STATUS_LABELS,
} from './governance.constants';

// EBD constants
export {
  STUDENT_ROLE_OPTIONS,
  STUDENT_ROLE_LABELS,
} from './ebd.constants';
