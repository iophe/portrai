package ai

import (
	"backend/lib/utils"
	"context"
	"fmt"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"
)

var ANTHROPIC *anthropic.Client = anthropic.NewClient(
	option.WithAPIKey(utils.ANTHROPIC_SECRET_KEY),
)

func ExempleSendClaudeMessage() {
	message, err := ANTHROPIC.Messages.New(context.TODO(), anthropic.MessageNewParams{
		Model:     anthropic.F(anthropic.ModelClaude3_5HaikuLatest),
		MaxTokens: anthropic.F(int64(1024)),
		Messages: anthropic.F([]anthropic.MessageParam{
			anthropic.NewUserMessage(anthropic.NewTextBlock("What is a quaternion?")),
		}),
	})
	if err != nil {
		panic(err.Error())
	}
	fmt.Printf("%+v\n", message.Content)
}
