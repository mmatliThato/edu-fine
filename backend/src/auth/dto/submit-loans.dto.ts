
import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class SubmitLoansDto {
  @IsArray()
  @ArrayMinSize(8)
  @ArrayMaxSize(8)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(8, { each: true })
  tileOrder: number[];
}
