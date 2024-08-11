// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./QaCoin.sol";

contract QnA {
    QaCoin public token;

    struct Question {
        uint256 id;
        address asker;
        string content;
        uint256 reserve;
        uint256 createdAt;
        bool rewardClaimed;
        uint256 upvotes;
    }

    struct Answer {
        uint256 id;
        address replier;
        string content;
        uint256 upvotes;
        uint256 reserve;
        bool rewardClaimed;
    }

    struct Vote {
        address voter;
        uint256 tokens;
        bool rewardClaimed;
    }

    uint256 public nextAnswerId;
    Question[] public questions;
    mapping(uint256 => mapping(uint256 => Answer)) public answers;
    mapping(uint256 => mapping(address => Vote)) public questionVotes;
    mapping(uint256 => mapping(address => Vote)) public answerVotes;

    uint256 public upvoteDeadline = 3 days;
    uint256 public answerDeadline = 7 days;

    event QuestionPosted(
        uint256 questionId,
        address asker,
        string content,
        uint256 reserve 
    );
    event QuestionUpvoted(uint256 questionId, address voter, uint256 tokens);
    event AnswerPosted(uint256 questionId, uint256 answerId, address replier, string content, uint256 reserve);
    event AnswerUpvoted(
        uint256 questionId,
        uint256 answerId,
        address voter,
        uint256 tokens
    );

    constructor(address tokenAddress) {
        token = QaCoin(tokenAddress);
    }

    function questionLength() external view returns (uint256) {
        return questions.length;
    }

    function postQuestion(string calldata content, uint256 reserve) external {
        require(
            token.transferFrom(msg.sender, address(this), reserve),
            "Failed to transfer tokens"
        );
        uint256 id = questions.length;
        questions.push(
            Question(id, msg.sender, content, reserve, block.timestamp, false, 0)
        );
        emit QuestionPosted(id, msg.sender, content, reserve);
    }

    function upvoteQuestion(uint256 questionId, uint256 tokens) external {
        require(
            block.timestamp <= questions[questionId].createdAt + upvoteDeadline,
            "Voting deadline has passed"
        );
        require(
            token.transferFrom(msg.sender, address(this), tokens),
            "Failed to transfer tokens"
        );
        Question storage question = questions[questionId];
        question.upvotes += tokens;
        questionVotes[questionId][msg.sender] = Vote(msg.sender, tokens, false);
        emit QuestionUpvoted(questionId, msg.sender, tokens);
    }

    function postAnswer(uint256 questionId, string calldata content, uint256 tokens) external {
        require(
            block.timestamp <= questions[questionId].createdAt + answerDeadline,
            "Answer deadline has passed"
        );
        require(
            token.transferFrom(msg.sender, address(this), tokens),
            "Failed to transfer tokens"
        );
        uint256 id = nextAnswerId++;
        answers[questionId][id] = Answer(id, msg.sender, content, 0, tokens, false);
        emit AnswerPosted(questionId, id, msg.sender, content, tokens);
    }

    function upvoteAnswer(
        uint256 questionId,
        uint256 answerId,
        uint256 tokens
    ) external {
        require(
            block.timestamp <= questions[questionId].createdAt + answerDeadline,
            "Voting deadline has passed"
        );
        require(
            token.transferFrom(msg.sender, address(this), tokens),
            "Failed to transfer tokens"
        );
        Answer storage answer = answers[questionId][answerId];
        answer.upvotes += tokens;
        emit AnswerUpvoted(questionId, answerId, msg.sender, tokens);
    }

    function claimReserveQuestion(uint256 questionId) external {
        Question storage question = questions[questionId];
        require(!question.rewardClaimed, "reserve already claimed");
        require(
            block.timestamp > question.createdAt + answerDeadline,
            "Deadline not yet passed"
        );
        require(question.asker == msg.sender, "Only asker can claim reserve");
        require(
            question.upvotes >= question.reserve,
            "Question did not get enough upvotes"
        );

        token.transfer(question.asker, question.reserve);
        question.rewardClaimed = true;
    }

    function claimReserveAnswer(uint256 questionId, uint256 answerId) external {
        Answer storage answer = answers[questionId][answerId];
        require(!answer.rewardClaimed, "reward already claimed");
        require(
            block.timestamp > questions[questionId].createdAt + answerDeadline,
            "Deadline not yet passed"
        );
        require(answer.replier == msg.sender, "Only replier can claim reward");
        require(
            answer.upvotes >= answer.reserve,
            "Answer did not get enough upvotes"
        );

        token.transfer(answer.replier, answer.reserve);
        answer.rewardClaimed = true;
    }

    function claimReserveVoteQuestion(uint256 questionId) external {
        Vote storage vote = questionVotes[questionId][msg.sender];
        require(!vote.rewardClaimed, "reward already claimed");
        require(
            block.timestamp > questions[questionId].createdAt + answerDeadline,
            "Deadline not yet passed"
        );
        require(vote.voter == msg.sender, "Only voter can claim reward");

        token.transfer(vote.voter, vote.tokens);
        vote.rewardClaimed = true;
    }
}
