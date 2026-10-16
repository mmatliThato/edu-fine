
import {
  IsArray,
  IsInt,
  ArrayMinSize,
  ArrayMaxSize,
  Max,
  Min,
} from 'class-validator';

export class SubmitAnswersDto {
  @IsArray()
  @ArrayMinSize(5)
  @ArrayMaxSize(5)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(3, { each: true })
  answers: number[];
}
