import React, { useState } from 'react';
import { Box, Pagination } from '@mui/material';
import { Question } from '../types/Question';
import QuestionList from './QuestionList';

interface QuestionFeedProps {
  questions: Question[];
  handleQuestionClick: (question: Question) => void;
}

const QUESTIONS_PER_PAGE = 6;

const QuestionFeed: React.FC<QuestionFeedProps> = ({ questions, handleQuestionClick }) => {
  const [page, setPage] = useState(1);
  const paginatedQuestions = questions.slice((page-1)* QUESTIONS_PER_PAGE, page*QUESTIONS_PER_PAGE);

  return (
    <Box sx={{width: '100%'}}>
      <QuestionList questions={paginatedQuestions} handleQuestionClick={handleQuestionClick} />
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            shape="rounded"
            variant="outlined"
            count={Math.ceil(questions.length / QUESTIONS_PER_PAGE)}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="secondary"
          />
      </Box>
    </Box>
  );
};

export default QuestionFeed;
