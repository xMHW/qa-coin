// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./QaCoin.sol";

contract QnA {
    QaCoin public token;

    struct Question {
        address asker;
        string content;
        uint256 bounty;
        uint256 createdAt;
        bool bountyClaimed;
        uint256 upvotes; // New field to track upvotes
    }

    struct Answer {
        address replier;
        string content;
        uint256 upvotes;
        uint256 lastUpvoted;
    }

    Question[] public questions;
    mapping(uint256 => Answer[]) public answers;
    mapping(address => uint256) public participationReward;

    uint256 public answerDeadline = 3 days;
    uint256 public rewardClaimDeadline = 30 days;

    event QuestionPosted(
        uint256 questionId,
        address asker,
        string content,
        uint256 bounty
    );
    event QuestionUpvoted(uint256 questionId, address voter, uint256 tokens);
    event AnswerPosted(uint256 questionId, address replier, string content);
    event AnswerUpvoted(
        uint256 questionId,
        uint256 answerId,
        address voter,
        uint256 tokens
    );

    constructor(address tokenAddress) {
        token = QaCoin(tokenAddress);
    }

    function postQuestion(string calldata content, uint256 bounty) external {
        require(
            token.transferFrom(msg.sender, address(this), bounty),
            "Failed to transfer tokens"
        );
        uint256 id = questions.length;
        questions.push(
            Question(msg.sender, content, bounty, block.timestamp, false, 0)
        );
        emit QuestionPosted(id, msg.sender, content, bounty);
    }

    function upvoteQuestion(uint256 questionId, uint256 tokens) external {
        require(
            token.transferFrom(msg.sender, address(this), tokens),
            "Failed to transfer tokens"
        );
        Question storage question = questions[questionId];
        question.upvotes += tokens;
        emit QuestionUpvoted(questionId, msg.sender, tokens);
    }

    function postAnswer(uint256 questionId, string calldata content) external {
        require(
            block.timestamp <= questions[questionId].createdAt + answerDeadline,
            "Answer deadline has passed"
        );
        answers[questionId].push(Answer(msg.sender, content, 0, 0));
        emit AnswerPosted(questionId, msg.sender, content);
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

    function claimBounty(uint256 questionId) external {
        Question storage question = questions[questionId];
        require(!question.bountyClaimed, "Bounty already claimed");
        require(
            block.timestamp > question.createdAt + answerDeadline,
            "Deadline not yet passed"
        );

        token.transfer(question.asker, question.bounty);
        question.bountyClaimed = true;
    }

    function claimParticipationRewards() external {
        require(
            block.timestamp > rewardClaimDeadline,
            "Reward claim period not yet started"
        );
        uint256 reward = participationReward[msg.sender];
        require(reward > 0, "No rewards available");

        token.transfer(msg.sender, reward * 2); // Double the tokens
        participationReward[msg.sender] = 0; // Reset the reward balance
    }
}
