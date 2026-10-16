
import { IsInt, Max, Min } from 'class-validator';

export class SaveVatDto {
  @IsInt()
  @Min(0)
  @Max(100)
  score: number;
}
