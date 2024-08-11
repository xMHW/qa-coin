import React from 'react';
import { Box, Button, Typography, Modal } from '@mui/material';
import { Question } from '../types/Question';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

interface QuestionModalProps {
  open: boolean;
  onClose: () => void;
  question: Question | null;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const QuestionModal = ({ open, onClose, question }: QuestionModalProps) => {
  console.log(question, 'question');
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h3">
          Question: {question?.content}
        </Typography>
        {question?.isMine ? (
          <Typography>Claim Amount: {question?.claimAmount}</Typography>
        ) : (
          <Button onClick={onClose}>Upvote</Button>
        )}
      </Box>
    </Modal>
  );
};

export default QuestionModal;
