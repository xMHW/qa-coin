import React, { useState } from 'react';
import { Box, Button, Typography, Modal, Divider } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Question } from '../types/Question';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

interface QuestionModalProps {
  open: boolean;
  onClose: () => void;
  question: Question | null;
  handleUpvote: (question: Question) => void;
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

const QuestionModal = ({ open, onClose, question, handleUpvote }: QuestionModalProps) => {
  const [upvoteLoading, setUpvoteLoading] = useState<boolean>(false);
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h3">
          Question: {question?.content}
        </Typography>
        <Divider sx={{ m: 2 }} />
        {question?.isMine ? (
          <Typography>Claim Amount: {question?.claimAmount}</Typography>
        ) : (
          <LoadingButton
            variant="outlined"
            onClick={() => {
              setUpvoteLoading(true);
              handleUpvote(question!);
              setUpvoteLoading(false);
            }}
            loading={upvoteLoading}
          >
            <ThumbUpIcon sx={{ mr: 1 }} />
            Upvote
          </LoadingButton>
        )}
      </Box>
    </Modal>
  );
};

export default QuestionModal;
