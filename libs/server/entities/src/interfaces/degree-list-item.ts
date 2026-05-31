import { DegreeType, DegreeYear, MacroArea } from '../entities/dto/degree.enum.js';

export interface DegreeListItem {
    id: number;
    degreeName: string;
    degreeType: DegreeType;
    degreeYear: DegreeYear;
    macroArea: MacroArea;
}
