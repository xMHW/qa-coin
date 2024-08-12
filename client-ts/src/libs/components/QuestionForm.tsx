import React, { useState } from 'react';
import { Box, TextField, InputAdornment, Paper, InputBase, IconButton } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import EditIcon from '@mui/icons-material/Edit';

interface QuestionFormProps {
  handlePostQuestion: (question: string, claimAmount: number) => Promise<void>;
  postLoading: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ handlePostQuestion, postLoading }) => {
  const [question, setQuestion] = useState<string>('');
  const [claimAmount, setClaimAmount] = useState<number>(100);
  const [claimAmountError, setClaimAmountError] = useState<boolean>(false);

  const handleClaimAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amount = parseInt(e.target.value);
    if (amount < 100 || amount > 1000) {
      setClaimAmountError(true);
    } else {
      setClaimAmountError(false);
      setClaimAmount(amount);
    }
  };

  const onPostQuestion = () => {
    if (!claimAmountError && question) {
      handlePostQuestion(question, claimAmount);
    }
  };

  return (
    <Box>
      <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', mb: 2 }}>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Input your question here"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <IconButton disabled type="button" sx={{ p: '10px' }} aria-label="search">
          <EditIcon />
        </IconButton>
      </Paper>
      <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
        <TextField
          label="Claim token amount"
          value={claimAmount}
          onChange={handleClaimAmountChange}
          error={claimAmountError}
          helperText={claimAmountError ? 'Amount must be 100~1000' : ''}
          InputProps={{
            endAdornment: <InputAdornment position="end">token</InputAdornment>,
          }}
          sx={{ flexGrow: 1, mr: 2 }}
        />
        <LoadingButton
          variant="contained"
          onClick={onPostQuestion}
          loading={postLoading}
          sx={{ minWidth: '120px', color: '#fff', bgcolor: '#938AF8'}} // Adjust this value as needed
        >
          Post
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default QuestionForm;